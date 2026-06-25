import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Tab,
  Button,
  Badge,
  Form,
  Alert,
  Spinner,
  ListGroup,
  Modal,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateLocalUser } from "../features/auth/authSlice";
import { fetchSkills, addSkill } from "../features/skills/skillsSlice";
import {
  fetchContacts,
  acceptContact,
  sendContactRequest,
} from "../features/contacts/contactsSlice";
import { fetchMessages, sendMessage } from "../features/messages/messagesSlice";
import {
  fetchAllUsers,
  updateUser,
  updateUserStatus,
  likeUser,
} from "../features/users/usersSlice";
import { payPremium } from "../features/payments/paymentsSlice";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  addCategory,
  fetchCategories,
  fetchEvents,
  fetchMyRegistrations,
} from "../features/events/eventsSlice";
import { useNavigate } from "react-router-dom";

const skillSchema = yup.object({
  title: yup.string().required("Le titre est requis"),
  description: yup.string().required("La description est requise"),
  daily_price: yup
    .number()
    .typeError("Le prix doit être un nombre")
    .positive("Le prix doit être supérieur à 0")
    .required("Le prix journalier est requis"),
});

const messageSchema = yup.object({
  message: yup.string().required("Le message ne peut pas être vide"),
});

export default function DashboardPage() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { skills, status: skillsStatus } = useSelector((state) => state.skills);
  const { list: contactsList, status: contactsStatus } = useSelector(
    (state) => state.contacts,
  );
  const { list, categories, status, myRegistrations } = useSelector(
    (state) => state.events,
  );
  const {
    received: receivedMessages,
    sent: sentMessages,
    status: messagesStatus,
  } = useSelector((state) => state.messages);
  const { list: usersList, status: usersStatus } = useSelector(
    (state) => state.users,
  );

  const [showSkillForm, setShowSkillForm] = useState(false);
  const [messageFilter, setMessageFilter] = useState("received");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [contactFeedback, setContactFeedback] = useState({});
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editUser, setEditUser] = useState(false);
  const [likedUsers, setLikedUsers] = useState({});
  const navigate = useNavigate();

  const {
    register: registerSkill,
    handleSubmit: handleSubmitSkill,
    reset: resetSkillForm,
    formState: { errors: skillErrors },
  } = useForm({
    resolver: yupResolver(skillSchema),
    defaultValues: { title: "", description: "", daily_price: "" },
  });

  const {
    register: registerMsg,
    handleSubmit: handleSubmitMsg,
    reset: resetMsgForm,
    formState: { errors: msgErrors },
  } = useForm({
    resolver: yupResolver(messageSchema),
    defaultValues: { message: "" },
  });

  useEffect(() => {
    dispatch(fetchSkills(user?.id));
    dispatch(fetchContacts());
    dispatch(fetchMessages("received"));
    dispatch(fetchMessages("sent"));
    dispatch(fetchAllUsers());
    dispatch(fetchCategories());
    dispatch(fetchEvents());
    dispatch(fetchMyRegistrations(user?.id));
  }, [dispatch]);

  const onSubmitSkill = async (data) => {
    try {
      await dispatch(addSkill(data)).unwrap();
      resetSkillForm();
      setShowSkillForm(false);
      dispatch(fetchSkills());
    } catch (error) {
      console.error("Erreur ajout compétence :", error);
    }
  };

  const handleAcceptContact = async (contactId) => {
    try {
      await dispatch(acceptContact(contactId)).unwrap();
    } catch (error) {
      console.error("Erreur acceptation contact :", error);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      await dispatch(addCategory({ name: categoryName })).unwrap();

      setCategoryName("");
      setShowCategoryForm(false);
      dispatch(fetchCategories());
    } catch (error) {
      console.error("Erreur ajout catégorie : ", error);
    }
  };

  const handleOpenMessageModal = (contact) => {
    setSelectedContact(contact);
    setShowMsgModal(true);
  };

  const onSubmitMessage = async (data) => {
    if (!selectedContact) return;
    try {
      const receiverId =
        selectedContact.requester_id === user.id
          ? selectedContact.receiver_id
          : selectedContact.requester_id;

      await dispatch(
        sendMessage({ receiver_id: receiverId, message: data.message }),
      ).unwrap();

      resetMsgForm();
      setShowMsgModal(false);
      setSelectedContact(null);
      dispatch(fetchMessages("sent"));
    } catch (error) {
      console.error("Erreur envoi message :", error);
    }
  };

  const handleReply = (msg) => {
    setSelectedContact({
      requester_id: msg.sender_id,
      receiver_id: user.id,
      requester_pseudo: msg.sender_pseudo,
      receiver_pseudo: user.pseudo,
    });
    setShowMsgModal(true);
  };

  const handleAddContact = async (memberId) => {
    setContactFeedback((prev) => ({ ...prev, [memberId]: "sending" }));
    try {
      await dispatch(sendContactRequest(memberId)).unwrap();
      setContactFeedback((prev) => ({ ...prev, [memberId]: "sent" }));
      dispatch(fetchContacts());
    } catch (error) {
      console.error("Erreur envoi demande de contact :", error);
      setContactFeedback((prev) => ({ ...prev, [memberId]: "error" }));
    }
  };

  const getContactStatus = (memberId) => {
    if (!Array.isArray(contactsList)) return null;
    const relation = contactsList.find(
      (c) => c.receiver_id === memberId || c.requester_id === memberId,
    );
    return relation ? relation.status : null;
  };

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      pseudo: user?.pseudo || "",
      email: user?.email || "",
      address: user?.address || "",
      postal_code: user?.postal_code || "",
      city: user?.city || "",
      phone: user?.phone || "",
      avatar: user?.avatar || "",
      birthdate: user?.birthdate || "",
      password: "",
    },
  });

  const onSubmitProfile = async (data) => {
    try {
      await dispatch(updateUser(data)).unwrap();
      dispatch(updateLocalUser(data));
      setEditUser(false);
    } catch (error) {
      console.error("Erreur modification profil :", error);
    }
  };

  const handleUpdateStatus = async (userId, newStatusId) => {
    try {
      await dispatch(
        updateUserStatus({
          user_id: userId,
          user_status_id: Number(newStatusId),
        }),
      ).unwrap();
      dispatch(fetchAllUsers());
    } catch (error) {
      console.error("Erreur modification statut :", error);
    }
  };

  const handleLikeUser = async (organizerId) => {
    try {
      await dispatch(likeUser(organizerId)).unwrap();
      setLikedUsers((prev) => ({ ...prev, [organizerId]: true }));
    } catch (error) {
      console.error("Erreur like :", error);
    }
  };

  const renderAddContactButton = (member) => {
    const status = getContactStatus(member.id);
    const feedback = contactFeedback[member.id];

    if (status === "accepted") {
      return (
        <Badge bg="success" className="px-3 py-2">
          ✓ Connecté
        </Badge>
      );
    }

    if (status === "pending" || feedback === "sent") {
      return (
        <Badge bg="warning" text="dark" className="px-3 py-2">
          ⏳ En attente
        </Badge>
      );
    }

    if (feedback === "error") {
      return (
        <Button
          size="sm"
          variant="danger"
          onClick={() => handleAddContact(member.id)}
        >
          Réessayer
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        variant="outline-primary"
        disabled={feedback === "sending"}
        onClick={() => handleAddContact(member.id)}
      >
        {feedback === "sending" ? (
          <>
            <Spinner animation="border" size="sm" className="me-1" />
            Envoi…
          </>
        ) : (
          "+ Ajouter"
        )}
      </Button>
    );
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Mon Espace Personnel</h2>
          <p className="text-muted">
            Bienvenue, {user?.firstname || user?.pseudo || "Utilisateur"} 👋
          </p>
        </div>
        <Button variant="outline-danger" onClick={() => dispatch(logout())}>
          Se déconnecter
        </Button>
      </div>

      <Tab.Container id="dashboard-tabs" defaultActiveKey="profil">
        <Row>
          <Col md={3} className="mb-4">
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-2">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link
                      eventKey="profil"
                      className="rounded-3 px-3 py-2 mb-1"
                    >
                      👤 Mon Profil
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="evenements"
                      className="rounded-3 px-3 py-2 mb-1"
                    >
                      📅 Événements
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="competences"
                      className="rounded-3 px-3 py-2 mb-1"
                    >
                      🎯 Compétences
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="communaute"
                      className="rounded-3 px-3 py-2 mb-1"
                    >
                      🌐 Communauté
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="contacts"
                      className="rounded-3 px-3 py-2 mb-1"
                    >
                      👥 Mes Contacts
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="messages"
                      className="rounded-3 px-3 py-2 mb-1"
                    >
                      💬 Messagerie
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="premium"
                      className="rounded-3 px-3 py-2 text-warning fw-bold"
                    >
                      ⭐ Abonnement
                    </Nav.Link>
                  </Nav.Item>
                  {user?.user_status_id === 3 && (
                    <Nav.Item>
                      <Nav.Link
                        eventKey="admin"
                        className="rounded-3 px-3 py-2 text-danger fw-bold"
                      >
                        ⚙️ Administration
                      </Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="profil">
                <Card className="border-0 shadow-sm rounded-4 mb-4">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="fw-bold mb-0">
                        Informations personnelles
                      </h4>
                      <Button
                        variant={
                          editUser ? "outline-secondary" : "outline-primary"
                        }
                        size="sm"
                        onClick={() => setEditUser(!editUser)}
                      >
                        {editUser ? "Annuler" : "✏️ Modifier"}
                      </Button>
                    </div>

                    {!editUser ? (
                      <>
                        <Row className="mb-3">
                          <Col sm={4} className="text-muted">
                            Avatar
                          </Col>
                          <Col sm={8}>
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt="Avatar"
                                className="rounded-circle"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-muted fst-italic">
                                Non renseigné
                              </span>
                            )}
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col sm={4} className="text-muted">
                            Nom complet
                          </Col>
                          <Col sm={8} className="fw-semibold">
                            {user?.firstname} {user?.lastname}
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col sm={4} className="text-muted">
                            Pseudo
                          </Col>
                          <Col sm={8} className="fw-semibold">
                            {user?.pseudo}
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col sm={4} className="text-muted">
                            Email
                          </Col>
                          <Col sm={8} className="fw-semibold">
                            {user?.email}
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col sm={4} className="text-muted">
                            Ville
                          </Col>
                          <Col sm={8} className="fw-semibold">
                            {user?.city} ({user?.postal_code})
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col sm={4} className="text-muted">
                            Adresse
                          </Col>
                          <Col sm={8} className="fw-semibold">
                            {user?.address}
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col sm={4} className="text-muted">
                            Téléphone
                          </Col>
                          <Col sm={8} className="fw-semibold">
                            {user?.phone || (
                              <span className="text-muted fst-italic">
                                Non renseigné
                              </span>
                            )}
                          </Col>
                        </Row>
                      </>
                    ) : (
                      <Form onSubmit={handleSubmitProfile(onSubmitProfile)}>
                        <Row className="g-3 mb-3">
                          <Col md={6}>
                            <Form.Group controlId="edit_firstname">
                              <Form.Label className="small fw-semibold text-secondary">
                                Prénom
                              </Form.Label>
                              <Form.Control
                                type="text"
                                {...registerProfile("firstname")}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="edit_lastname">
                              <Form.Label className="small fw-semibold text-secondary">
                                Nom
                              </Form.Label>
                              <Form.Control
                                type="text"
                                {...registerProfile("lastname")}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="edit_pseudo">
                              <Form.Label className="small fw-semibold text-secondary">
                                Pseudo
                              </Form.Label>
                              <Form.Control
                                type="text"
                                {...registerProfile("pseudo")}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="edit_email">
                              <Form.Label className="small fw-semibold text-secondary">
                                Email
                              </Form.Label>
                              <Form.Control
                                type="email"
                                {...registerProfile("email")}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Form.Group controlId="edit_address">
                              <Form.Label className="small fw-semibold text-secondary">
                                Adresse
                              </Form.Label>
                              <Form.Control
                                type="text"
                                {...registerProfile("address")}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group controlId="edit_postal_code">
                              <Form.Label className="small fw-semibold text-secondary">
                                Code postal
                              </Form.Label>
                              <Form.Control
                                type="text"
                                {...registerProfile("postal_code")}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={8}>
                            <Form.Group controlId="edit_city">
                              <Form.Label className="small fw-semibold text-secondary">
                                Ville
                              </Form.Label>
                              <Form.Control
                                type="text"
                                {...registerProfile("city")}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="edit_phone">
                              <Form.Label className="small fw-semibold text-secondary">
                                Téléphone
                              </Form.Label>
                              <Form.Control
                                type="text"
                                {...registerProfile("phone")}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="edit_avatar">
                              <Form.Label className="small fw-semibold text-secondary">
                                Avatar (nom du fichier)
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Ex: avatar.png"
                                {...registerProfile("avatar")}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="edit_password">
                              <Form.Label className="small fw-semibold text-secondary">
                                Nouveau mot de passe (vide = inchangé)
                              </Form.Label>
                              <Form.Control
                                type="password"
                                {...registerProfile("password")}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setEditUser(false)}
                          >
                            Annuler
                          </Button>
                          <Button type="submit" variant="success" size="sm">
                            ✅ Enregistrer
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="evenements">
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <h4 className="fw-bold mb-4">📅 Mes Événements</h4>

                    {!user?.is_premium ? (
                      <Alert variant="warning" className="text-center">
                        <Alert.Heading>Fonctionnalité Premium 🌟</Alert.Heading>
                        <p className="mb-0">
                          Tu dois être Premium pour créer des événements.
                        </p>
                      </Alert>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <p className="text-muted mb-0">
                            Tes événements organisés.
                          </p>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/events/create")}
                          >
                            + Créer un événement
                          </Button>
                        </div>

                        <h6 className="fw-bold text-success mb-3">
                          🟢 En cours / À venir
                        </h6>
                        {list.filter(
                          (e) =>
                            e.user_id === user?.id &&
                            new Date(e.end_date) >= new Date(),
                        ).length > 0 ? (
                          <Row className="g-3 mb-4">
                            {list
                              .filter(
                                (e) =>
                                  e.user_id === user?.id &&
                                  new Date(e.end_date) >= new Date(),
                              )
                              .map((event) => (
                                <Col md={6} key={event.id}>
                                  <Card className="border-0 shadow-sm bg-light h-100">
                                    <Card.Body>
                                      <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h6 className="fw-bold mb-0">
                                          {event.name}
                                        </h6>
                                        {event.price_type === "gratuit" ? (
                                          <Badge bg="success">Gratuit</Badge>
                                        ) : (
                                          <Badge bg="danger">
                                            {event.price} €
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-muted small mb-1">
                                        📅 {event.start_date}
                                      </p>
                                      <p className="text-muted small mb-2">
                                        👥 {event.participants_count} /{" "}
                                        {event.max_participants}
                                      </p>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() =>
                                          navigate(`/events/${event.id}`)
                                        }
                                      >
                                        Voir
                                      </Button>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}
                          </Row>
                        ) : (
                          <p className="text-muted small mb-4">
                            Aucun événement en cours.
                          </p>
                        )}

                        <h6 className="fw-bold text-secondary mb-3">
                          ⚫ Passés
                        </h6>
                        {list.filter(
                          (e) =>
                            e.user_id === user?.id &&
                            new Date(e.end_date) < new Date(),
                        ).length > 0 ? (
                          <Row className="g-3 mb-4">
                            {list
                              .filter(
                                (e) =>
                                  e.user_id === user?.id &&
                                  new Date(e.end_date) < new Date(),
                              )
                              .map((event) => (
                                <Col md={6} key={event.id}>
                                  <Card className="border-0 shadow-sm bg-light h-100 opacity-75">
                                    <Card.Body>
                                      <h6 className="fw-bold text-muted">
                                        {event.name}
                                      </h6>
                                      <p className="text-muted small mb-1">
                                        📅 {event.start_date}
                                      </p>
                                      <p className="text-muted small mb-0">
                                        👥 {event.participants_count} /{" "}
                                        {event.max_participants}
                                      </p>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}
                          </Row>
                        ) : (
                          <p className="text-muted small mb-4">
                            Aucun événement passé.
                          </p>
                        )}

                        <hr className="my-4" />
                        <h5 className="fw-bold mb-4">🎟️ Mes Inscriptions</h5>

                        <h6 className="fw-bold text-success mb-3">
                          🟢 À venir
                        </h6>
                        {myRegistrations.filter(
                          (e) => new Date(e.end_date) >= new Date(),
                        ).length > 0 ? (
                          <Row className="g-3 mb-4">
                            {myRegistrations
                              .filter((e) => new Date(e.end_date) >= new Date())
                              .map((event) => (
                                <Col md={6} key={event.id}>
                                  <Card className="border-0 shadow-sm bg-light h-100">
                                    <Card.Body>
                                      <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h6 className="fw-bold mb-0">
                                          {event.name}
                                        </h6>
                                        {event.price_type === "gratuit" ? (
                                          <Badge bg="success">Gratuit</Badge>
                                        ) : (
                                          <Badge bg="danger">
                                            {event.price} €
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-muted small mb-1">
                                        📅 {event.start_date}
                                      </p>
                                      <p className="text-muted small mb-2">
                                        👤 {event.organizer_pseudo}
                                      </p>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() =>
                                          navigate(`/events/${event.id}`)
                                        }
                                      >
                                        Voir
                                      </Button>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}
                          </Row>
                        ) : (
                          <p className="text-muted small mb-4">
                            Aucune inscription à venir.
                          </p>
                        )}

                        <h6 className="fw-bold text-secondary mb-3">
                          ⚫ Passées
                        </h6>
                        {myRegistrations.filter(
                          (e) => new Date(e.end_date) < new Date(),
                        ).length > 0 ? (
                          <Row className="g-3">
                            {myRegistrations
                              .filter((e) => new Date(e.end_date) < new Date())
                              .map((event) => (
                                <Col md={6} key={event.id}>
                                  <Card className="border-0 shadow-sm bg-light h-100 opacity-75">
                                    <Card.Body>
                                      <h6 className="fw-bold text-muted">
                                        {event.name}
                                      </h6>
                                      <p className="text-muted small mb-1">
                                        📅 {event.start_date}
                                      </p>
                                      <p className="text-muted small mb-2">
                                        👤 {event.organizer_pseudo}
                                      </p>
                                      <div className="d-flex gap-2">
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          onClick={() =>
                                            navigate(`/events/${event.id}`)
                                          }
                                        >
                                          Voir
                                        </Button>
                                        {event.user_id !== user?.id && ( // ← pas de like sur ses propres events
                                          <Button
                                            variant={
                                              likedUsers[event.user_id]
                                                ? "danger"
                                                : "outline-danger"
                                            }
                                            size="sm"
                                            disabled={likedUsers[event.user_id]}
                                            onClick={() =>
                                              handleLikeUser(event.user_id)
                                            }
                                          >
                                            {likedUsers[event.user_id]
                                              ? "❤️ Liké"
                                              : "🤍 Liker"}
                                          </Button>
                                        )}
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}
                          </Row>
                        ) : (
                          <p className="text-muted small">
                            Aucune inscription passée.
                          </p>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="competences">
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <h4 className="fw-bold mb-4">
                      Mes Compétences (Offres de service)
                    </h4>

                    {!user?.is_premium ? (
                      <Alert variant="warning" className="text-center">
                        <Alert.Heading>Fonctionnalité Premium 🌟</Alert.Heading>
                        <p className="mb-0">
                          Tu dois être membre Premium pour proposer tes
                          services.
                        </p>
                      </Alert>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <p className="text-muted mb-0">
                            Gère tes offres de services ci-dessous.
                          </p>
                          <Button
                            variant={
                              showSkillForm ? "outline-secondary" : "primary"
                            }
                            size="sm"
                            onClick={() => setShowSkillForm(!showSkillForm)}
                          >
                            {showSkillForm
                              ? "Annuler"
                              : "+ Nouvelle compétence"}
                          </Button>
                        </div>

                        {showSkillForm && (
                          <Card className="bg-light border-0 mb-4 p-3">
                            <Form onSubmit={handleSubmitSkill(onSubmitSkill)}>
                              <Row className="g-3">
                                <Col md={8}>
                                  <Form.Group controlId="title">
                                    <Form.Label className="fw-semibold text-secondary small">
                                      Titre de l'offre
                                    </Form.Label>
                                    <Form.Control
                                      type="text"
                                      placeholder="Ex: Atelier React"
                                      isInvalid={!!skillErrors.title}
                                      {...registerSkill("title")}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                      {skillErrors.title?.message}
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                </Col>
                                <Col md={4}>
                                  <Form.Group controlId="daily_price">
                                    <Form.Label className="fw-semibold text-secondary small">
                                      Prix / Jour (€)
                                    </Form.Label>
                                    <Form.Control
                                      type="number"
                                      placeholder="Ex: 250"
                                      isInvalid={!!skillErrors.daily_price}
                                      {...registerSkill("daily_price")}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                      {skillErrors.daily_price?.message}
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                </Col>
                                <Col md={12}>
                                  <Form.Group controlId="description">
                                    <Form.Label className="fw-semibold text-secondary small">
                                      Description
                                    </Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      rows={2}
                                      placeholder="Description détaillée..."
                                      isInvalid={!!skillErrors.description}
                                      {...registerSkill("description")}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                      {skillErrors.description?.message}
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                </Col>
                              </Row>
                              <div className="text-end mt-3">
                                <Button
                                  type="submit"
                                  variant="success"
                                  size="sm"
                                  disabled={skillsStatus === "loading"}
                                >
                                  Enregistrer
                                </Button>
                              </div>
                            </Form>
                          </Card>
                        )}

                        {skillsStatus === "loading" && !showSkillForm ? (
                          <div className="text-center py-3">
                            <Spinner animation="border" variant="primary" />
                          </div>
                        ) : skills &&
                          skills.filter((s) => s.user_id === user?.id).length >
                            0 ? (
                          <Row className="g-3">
                            {skills
                              .filter((skill) => skill.user_id === user?.id)
                              .map((skill, idx) => (
                                <Col md={6} key={idx}>
                                  <Card className="h-100 border-0 shadow-sm bg-light">
                                    <Card.Body>
                                      <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h6 className="fw-bold mb-0">
                                          {skill.title}
                                        </h6>
                                        <Badge bg="success">
                                          {skill.daily_price} € / J
                                        </Badge>
                                      </div>
                                      <p className="text-muted small mb-0">
                                        {skill.description}
                                      </p>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}
                          </Row>
                        ) : (
                          <p className="text-muted text-center py-3">
                            Aucune compétence enregistrée.
                          </p>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="communaute">
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <h4 className="fw-bold mb-4">La Communauté</h4>
                    <p className="text-muted mb-4">
                      Découvre les membres et ajoute-les à ton réseau.
                    </p>

                    {usersStatus === "loading" ? (
                      <div className="text-center py-3">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : usersList?.filter((u) => u.id !== user?.id).length ===
                      0 ? (
                      <p className="text-muted text-center py-3">
                        Aucun autre membre pour le moment.
                      </p>
                    ) : (
                      <ListGroup variant="flush">
                        {usersList
                          ?.filter((u) => u.id !== user?.id)
                          .map((member) => (
                            <ListGroup.Item
                              key={member.id}
                              className="d-flex justify-content-between align-items-center px-0 py-3"
                            >
                              <div>
                                <span className="fw-semibold me-2">
                                  {member.pseudo}
                                </span>
                                {member.user_status_id === 3 ? (
                                  <Badge bg="danger">Admin</Badge>
                                ) : member.user_status_id === 2 ? (
                                  <Badge bg="primary">Organisateur</Badge>
                                ) : (
                                  <Badge bg="secondary">Membre</Badge>
                                )}
                                {member.city && (
                                  <div className="small text-muted mt-1">
                                    📍 {member.city}
                                  </div>
                                )}
                              </div>

                              {renderAddContactButton(member)}
                            </ListGroup.Item>
                          ))}
                      </ListGroup>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="contacts">
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <h4 className="fw-bold mb-4">Mes Réseaux & Contacts</h4>

                    {contactsStatus === "loading" ? (
                      <div className="text-center py-3">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : contactsList && contactsList.length > 0 ? (
                      <ListGroup variant="flush">
                        {contactsList.map((contact) => {
                          const isSender = contact.requester_id === user?.id;
                          const contactName = isSender
                            ? contact.receiver_pseudo
                            : contact.requester_pseudo;

                          return (
                            <ListGroup.Item
                              key={contact.id}
                              className="d-flex justify-content-between align-items-center px-0 py-3"
                            >
                              <div>
                                <span className="fw-semibold">
                                  {contactName}
                                </span>
                                <div className="small text-muted mt-1">
                                  {contact.status === "accepted" ? (
                                    <Badge bg="success">✓ Connecté</Badge>
                                  ) : isSender ? (
                                    <Badge bg="warning" text="dark">
                                      ⏳ Demande envoyée
                                    </Badge>
                                  ) : (
                                    <Badge bg="info" text="dark">
                                      📩 Demande reçue
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="d-flex gap-2">
                                {!isSender && contact.status === "pending" && (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() =>
                                      handleAcceptContact(contact.id)
                                    }
                                  >
                                    ✓ Accepter
                                  </Button>
                                )}

                                {contact.status === "accepted" && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() =>
                                      handleOpenMessageModal(contact)
                                    }
                                  >
                                    💬 Message
                                  </Button>
                                )}
                              </div>
                            </ListGroup.Item>
                          );
                        })}
                      </ListGroup>
                    ) : (
                      <p className="text-muted text-center py-3">
                        Tu n'as pas encore de contacts dans ton réseau.
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="messages">
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="fw-bold mb-0">Boîte de réception</h4>
                      <Nav
                        variant="pills"
                        activeKey={messageFilter}
                        onSelect={(k) => setMessageFilter(k)}
                      >
                        <Nav.Item>
                          <Nav.Link eventKey="received">Reçus</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="sent">Envoyés</Nav.Link>
                        </Nav.Item>
                      </Nav>
                    </div>

                    {messagesStatus === "loading" ? (
                      <div className="text-center py-3">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : (messageFilter === "received"
                        ? receivedMessages
                        : sentMessages
                      )?.length > 0 ? (
                      <ListGroup variant="flush">
                        {(messageFilter === "received"
                          ? receivedMessages
                          : sentMessages
                        ).map((msg, idx) => (
                          <ListGroup.Item key={idx} className="px-0 py-3">
                            <div className="d-flex justify-content-between mb-1">
                              <span className="fw-bold text-primary">
                                {messageFilter === "received"
                                  ? `De : ${msg.sender_pseudo}`
                                  : `À : ${msg.receiver_pseudo}`}
                              </span>
                              <span className="text-muted small">
                                {msg.created_at}
                              </span>
                            </div>
                            <p className="mb-0 bg-light p-2 rounded-3 text-secondary small">
                              {msg.message}
                            </p>
                            {messageFilter === "received" && (
                              <div className="text-end mt-2">
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleReply(msg)}
                                >
                                  ↩ Répondre
                                </Button>
                              </div>
                            )}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <p className="text-muted text-center py-3">
                        Aucun message dans cette boîte.
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="premium">
                <Card className="border-0 shadow-sm rounded-4 bg-dark text-white overflow-hidden">
                  <Card.Body className="p-4 text-center py-5">
                    {user?.is_premium ? (
                      <div className="py-4">
                        <div className="display-4 mb-3">👑</div>
                        <h3 className="fw-bold text-warning mb-3">
                          Compte Premium Actif
                        </h3>
                        <p className="text-light opacity-75 mb-0">
                          Félicitations ! Tu as débloqué toutes les
                          fonctionnalités avancées de Community Hub. Tu peux dès
                          à présent proposer tes compétences et organiser des
                          événements premium.
                        </p>
                      </div>
                    ) : (
                      <>
                        <h4 className="fw-bold text-warning mb-2">
                          Community Hub Premium
                        </h4>
                        <p className="text-light opacity-75 mb-4">
                          Passe au niveau supérieur ! Débloque la création
                          d'événements et la mise en avant de tes compétences.
                        </p>

                        <Card
                          className="bg-light text-dark mx-auto border-0 text-start shadow"
                          style={{ maxWidth: "400px" }}
                        >
                          <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3 d-flex justify-content-between align-items-center">
                              Paiement Sécurisé
                              <Badge bg="primary">Stripe</Badge>
                            </h5>

                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-semibold text-secondary">
                                Nom sur la carte
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Ex: Jean Dupont"
                                defaultValue={`${user?.firstname ?? ""} ${user?.lastname ?? ""}`}
                              />
                            </Form.Group>

                            <Form.Group className="mb-4">
                              <Form.Label className="small fw-semibold text-secondary">
                                Numéro de carte (Simulation)
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="4242 4242 4242 4242"
                              />
                            </Form.Group>

                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="fw-bold">Total à payer :</span>
                              <span className="fs-5 fw-bold text-success">
                                19.99 €
                              </span>
                            </div>

                            <Button
                              variant="warning"
                              className="w-100 fw-bold py-2 rounded-pill"
                              onClick={() =>
                                dispatch(
                                  payPremium({
                                    payment_method: "stripe",
                                    amount: 19.99,
                                  }),
                                )
                              }
                            >
                              Confirmer le paiement simulé
                            </Button>
                          </Card.Body>
                        </Card>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              {user?.user_status_id === 3 && (
                <Tab.Pane eventKey="admin">
                  <Card className="border-0 shadow-sm rounded-4">
                    <Card.Body className="p-4">
                      <h4 className="fw-bold mb-4">⚙️ Gestion des membres</h4>
                      <p className="text-muted mb-4">
                        {usersList?.length || 0} membre(s) inscrit(s) sur la
                        plateforme.
                      </p>

                      {usersStatus === "loading" ? (
                        <div className="text-center py-3">
                          <Spinner animation="border" variant="primary" />
                        </div>
                      ) : (
                        <ListGroup variant="flush">
                          {usersList?.map((member) => (
                            <ListGroup.Item
                              key={member.id}
                              className="d-flex justify-content-between align-items-center px-0 py-3"
                            >
                              <div className="d-flex align-items-center gap-3">
                                <div>
                                  <span className="fw-semibold">
                                    {member.pseudo}
                                  </span>
                                  {member.user_status_id === 3 ? (
                                    <Badge bg="danger" className="ms-2">
                                      Admin
                                    </Badge>
                                  ) : member.user_status_id === 2 ? (
                                    <Badge bg="primary" className="ms-2">
                                      Organisateur
                                    </Badge>
                                  ) : (
                                    <Badge bg="secondary" className="ms-2">
                                      Membre
                                    </Badge>
                                  )}
                                  {member.is_premium === 1 && (
                                    <Badge
                                      bg="warning"
                                      text="dark"
                                      className="ms-1"
                                    >
                                      ⭐ Premium
                                    </Badge>
                                  )}
                                  {member.city && (
                                    <div className="small text-muted mt-1">
                                      📍 {member.city}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {member.id !== user?.id && (
                                <Form.Select
                                  size="sm"
                                  style={{ width: "150px" }}
                                  value={member.user_status_id}
                                  onChange={(e) =>
                                    handleUpdateStatus(
                                      member.id,
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value={1}>Membre</option>
                                  <option value={2}>Organisateur</option>
                                  <option value={3}>Admin</option>
                                </Form.Select>
                              )}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                      <hr className="my-4" />

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">
                          🏷️ Catégories d'événements
                        </h5>
                        <Button
                          variant={
                            showCategoryForm
                              ? "outline-secondary"
                              : "outline-primary"
                          }
                          size="sm"
                          onClick={() => setShowCategoryForm(!showCategoryForm)}
                        >
                          {showCategoryForm ? "Annuler" : "+ Ajouter"}
                        </Button>
                      </div>

                      {showCategoryForm && (
                        <div className="d-flex gap-2 mb-3">
                          <Form.Control
                            type="text"
                            placeholder="Nom de la catégorie"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                          />
                          <Button
                            variant="success"
                            size="sm"
                            onClick={handleAddCategory}
                          >
                            Enregistrer
                          </Button>
                        </div>
                      )}

                      <div className="d-flex flex-wrap gap-2">
                        {categories?.length > 0 ? (
                          categories.map((cat) => (
                            <Badge
                              key={cat.id}
                              bg="secondary"
                              className="px-3 py-2 fs-6"
                            >
                              {cat.name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted small">Aucune catégorie.</p>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              )}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      <Modal show={showMsgModal} onHide={() => setShowMsgModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold h5">
            Nouveau message privé
            {selectedContact && (
              <span className="text-muted fw-normal ms-2 fs-6">
                -{" "}
                {selectedContact.requester_id === user?.id
                  ? selectedContact.receiver_pseudo
                  : selectedContact.requester_pseudo}
              </span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitMsg(onSubmitMessage)}>
          <Modal.Body>
            <Form.Group controlId="messageText">
              <Form.Label className="text-muted small">
                Message destiné à un membre connecté
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Écris ton message ici..."
                isInvalid={!!msgErrors.message}
                {...registerMsg("message")}
              />
              <Form.Control.Feedback type="invalid">
                {msgErrors.message?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowMsgModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Envoyer le message
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
