import { Badge, Row, Col } from "react-bootstrap";

function EventDetail({ event }) {
  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h2 className="fw-bold">{event.name}</h2>
        <div className="d-flex gap-2">
          <Badge bg="secondary">{event.category_name}</Badge>
          <Badge bg="info" text="dark">{event.event_type}</Badge>
          {event.price_type === "gratuit"
            ? <Badge bg="success">Gratuit</Badge>
            : <Badge bg="danger">{event.price} €</Badge>
          }
        </div>
      </div>

      <p className="text-muted mb-4">{event.introduction}</p>
      <Row className="g-3">
        <Col md={3}>
          <div className="small text-muted">📅 Début</div>
          <div className="fw-semibold">{event.start_date}</div>
        </Col>
        <Col md={3}>
          <div className="small text-muted">📅 Fin</div>
          <div className="fw-semibold">{event.end_date}</div>
        </Col>
        <Col md={2}>
          <div className="small text-muted">👤 Organisateur</div>
          <div className="fw-semibold">{event.organizer_pseudo}</div>
        </Col>
        <Col md={2}>
          <div className="small text-muted">👥 Participants</div>
          <div className="fw-semibold">
            {event.participants_count} / {event.max_participants}
            {event.participants_count >= event.max_participants && (
              <Badge bg="danger" className="ms-2">Complet</Badge>
            )}
          </div>
        </Col>
        <Col md={2}>
          <div className="small text-muted">❤️ Likes</div>
          <div className="fw-semibold">{event.organizer_likes_count || 0}</div>
        </Col>
      </Row>
    </>
  );
}

export default EventDetail;