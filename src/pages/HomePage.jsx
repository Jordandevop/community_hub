import { useEffect } from "react";
import { Container, Row, Col, Button, Card, Badge, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "../features/events/eventsSlice";
import { fetchSkills } from "../features/skills/skillsSlice";

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: events, status: eventsStatus } = useSelector((state) => state.events);
  const { skills, status: skillsStatus } = useSelector((state) => state.skills);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchEvents({ date_filter: "upcoming" }));
    dispatch(fetchSkills());
  }, [dispatch]);

  const upcomingEvents = events.slice(0, 3);
  const featuredSkills = skills.slice(0, 3);

  return (
    <>
      
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center py-4">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">
                Bienvenue sur <span className="text-warning">CommunityHub</span>
              </h1>
              <p className="lead mb-4 opacity-75">
                La plateforme pour développer ton réseau. Crée des événements premium,
                propose tes compétences et échange avec les membres.
              </p>
              <div className="d-flex flex-wrap gap-3">
                {!user ? (
                  <>
                    <Button as={Link} to="/register" variant="warning" size="lg" className="fw-bold rounded-pill px-4">
                      Rejoindre la communauté
                    </Button>
                    <Button as={Link} to="/login" variant="outline-light" size="lg" className="rounded-pill px-4">
                      Se connecter
                    </Button>
                  </>
                ) : (
                  <Button as={Link} to="/events" variant="warning" size="lg" className="fw-bold rounded-pill px-4">
                    Voir les événements
                  </Button>
                )}
              </div>
            </Col>

            <Col lg={6}>
              <Row className="g-3">
                {[
                  { icon: "🎉", title: "Événements", desc: "Présentiel ou distanciel" },
                  { icon: "🎯", title: "Compétences", desc: "Monétise ton savoir-faire" },
                  { icon: "👥", title: "Réseau", desc: "Contacte les membres" },
                  { icon: "💬", title: "Messagerie", desc: "Échanges privés sécurisés" },
                ].map((item) => (
                  <Col sm={6} key={item.title}>
                    <Card className="border-0 bg-white bg-opacity-10 text-white rounded-4 h-100">
                      <Card.Body className="p-3">
                        <div className="fs-3 mb-2">{item.icon}</div>
                        <h6 className="fw-bold mb-1">{item.title}</h6>
                        <small className="opacity-75">{item.desc}</small>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">🎉 Événements à venir</h2>
          <Button variant="outline-primary" as={Link} to="/events" size="sm" className="rounded-pill">
            Voir tout
          </Button>
        </div>

        {eventsStatus === "loading" ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : upcomingEvents.length > 0 ? (
          <Row className="g-4">
            {upcomingEvents.map((event) => (
              <Col md={4} key={event.id}>
                <Card
                  className="border-0 shadow-sm rounded-4 h-100"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Badge bg="secondary" className="mb-2">{event.category_name}</Badge>
                      {event.price_type === "gratuit"
                        ? <Badge bg="success">Gratuit</Badge>
                        : <Badge bg="danger">{event.price} €</Badge>
                      }
                    </div>
                    <h5 className="fw-bold mb-2">{event.name}</h5>
                    <p className="text-muted small mb-3">
                      {event.introduction?.slice(0, 80)}...
                    </p>
                    <div className="small text-muted">
                      <div>📅 {event.start_date}</div>
                      <div>👤 {event.organizer_pseudo}</div>
                      <div>👥 {event.participants_count} / {event.max_participants} participants</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p className="text-muted text-center py-4">Aucun événement à venir pour le moment.</p>
        )}
      </Container>
      <div className="bg-light py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">🎯 Compétences disponibles</h2>
          </div>

          {skillsStatus === "loading" ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : featuredSkills.length > 0 ? (
            <Row className="g-4">
              {featuredSkills.map((skill) => (
                <Col md={4} key={skill.id}>
                  <Card className="border-0 shadow-sm rounded-4 h-100">
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="fw-bold mb-0">{skill.title}</h5>
                        <Badge bg="success">{skill.daily_price} € / J</Badge>
                      </div>
                      <p className="text-muted small mb-3">{skill.description}</p>
                      <div className="small text-muted">
                        👤 {skill.pseudo}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-muted text-center py-4">Aucune compétence disponible pour le moment.</p>
          )}
        </Container>
      </div>

      {!user?.is_premium && (
        <Container className="py-5 text-center">
          <h2 className="fw-bold mb-3">Passe au niveau supérieur 🚀</h2>
          <p className="text-muted mb-4">
            Deviens membre Premium pour créer des événements et proposer tes compétences.
          </p>
          <Button
            as={Link}
            to={user ? "/dashboard" : "/register"}
            variant="warning"
            size="lg"
            className="fw-bold rounded-pill px-5"
          >
            {user ? "Passer Premium" : "S'inscrire gratuitement"}
          </Button>
        </Container>
      )}
    </>
  );
}
