import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchEventById,
  registerToEvent,
  sendEventMessage,
} from "../features/events/eventsSlice";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  Spinner,
  Alert,
  ListGroup,
} from "react-bootstrap";
import EventDetail from "../components/events/EventDetail";

function EventDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { current, status } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  const [messageText, setMessageText] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    dispatch(fetchEventById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (current?.messages) {
      setMessages(current.messages);
    }
  }, [current]);

  const handleRegister = async (paymentMethod) => {
    setRegisterError(null);
    try {
      await dispatch(
        registerToEvent({
          event_id: current.id,
          payment_method: paymentMethod,
        }),
      ).unwrap();
      setRegisterSuccess(true);
      dispatch(fetchEventById(id));
    } catch (error) {
      setRegisterError(error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    try {
      await dispatch(
        sendEventMessage({
          event_id: current.id,
          message: messageText,
        }),
      ).unwrap();
      setMessageText("");
      dispatch(fetchEventById(id));
    } catch (error) {
      console.error("Erreur envoi message : ", error);
    }
  };

  if (status === "loading" || !current) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const isFull = current.participants_count >= current.max_participants;
  const isOrganizer = user?.id === current.user_id;

  return (
    <Container className="py-5">
      <Button
        variant="outline-secondary"
        size="sm"
        className="mb-4"
        onClick={() => navigate("/events")}
      >
        ← Retour aux événements
      </Button>
      {(user?.id === current.user_id || user?.user_status_id === 3) && (
        <Button
          variant="outline-warning"
          size="sm"
          className="mb-4 ms-2"
          onClick={() => navigate(`/events/${id}/edit`)}
        >
          ✏️ Modifier l'événement
        </Button>
      )}

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <EventDetail event={current} />
        </Card.Body>
      </Card>
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <h5 className="fw-bold mb-4">🎟️ Inscription</h5>

          {registerSuccess && (
            <Alert variant="success">
              ✅ Inscription confirmée ! Un email de confirmation vous a été
              envoyé.
            </Alert>
          )}

          {registerError && <Alert variant="danger">{registerError}</Alert>}

          {!user && (
            <Alert variant="info">
              <Link to="/login">Connectez-vous</Link> pour vous inscrire à cet
              événement.
            </Alert>
          )}

          {user && !user.is_premium && (
            <Alert variant="warning">
              ⭐ Devenez <Link to="/dashboard">membre Premium</Link> pour vous
              inscrire aux événements.
            </Alert>
          )}

          {user && user.is_premium && isFull && (
            <Alert variant="danger">
              😞 Cet événement est complet - plus de places disponibles.
            </Alert>
          )}

          {user && user.is_premium && !isFull && !registerSuccess && (
            <>
              {current.price_type === "gratuit" ? (
                <div className="text-center">
                  <p className="text-muted mb-3">
                    Cet événement est gratuit - inscris-toi en un clic !
                  </p>
                  <Button
                    variant="success"
                    size="lg"
                    className="rounded-pill px-5"
                    onClick={() => handleRegister("stripe")}
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "S'inscrire gratuitement"
                    )}
                  </Button>
                </div>
              ) : (
                <Card
                  className="bg-light border-0 mx-auto"
                  style={{ maxWidth: "400px" }}
                >
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-3 d-flex justify-content-between">
                      Paiement sécurisé
                      <Badge bg="primary">Stripe</Badge>
                    </h6>

                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">
                        Nom sur la carte
                      </Form.Label>
                      <Form.Control
                        type="text"
                        defaultValue={`${user?.firstname ?? ""} ${user?.lastname ?? ""}`}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-semibold text-secondary">
                        Numéro de carte
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="4242 4242 4242 4242"
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-bold">Total :</span>
                      <span className="fs-5 fw-bold text-success">
                        {current.price} €
                      </span>
                    </div>

                    <div className="text-muted small mb-3">
                      ℹ️ Le site prélève une taxe de 10% - l'organisateur
                      recevra{" "}
                      <strong>{(current.price * 0.9).toFixed(2)} €</strong>.
                    </div>

                    <Button
                      variant="warning"
                      className="w-100 fw-bold rounded-pill"
                      onClick={() => handleRegister("stripe")}
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Confirmer le paiement"
                      )}
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <h5 className="fw-bold mb-4">💬 Forum de l'événement</h5>

          {messages.length > 0 ? (
            <ListGroup variant="flush" className="mb-4">
              {messages.map((msg) => (
                <ListGroup.Item key={msg.id} className="px-0 py-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-bold text-primary">{msg.pseudo}</span>
                    <span className="text-muted small">{msg.created_at}</span>
                  </div>
                  <p className="mb-0 bg-light p-2 rounded-3 text-secondary small">
                    {msg.message}
                  </p>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted mb-4">
              Aucun message pour le moment - sois le premier à écrire !
            </p>
          )}

          {user ? (
            <div className="d-flex gap-2">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Laisse un message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <Button
                variant="primary"
                className="align-self-end"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                Envoyer
              </Button>
            </div>
          ) : (
            <Alert variant="light" className="text-center">
              <Link to="/login">Connectez-vous</Link> pour laisser un message.
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EventDetailsPage;
