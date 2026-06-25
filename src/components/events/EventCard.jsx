import { useNavigate } from "react-router-dom";
import { Card, Badge, Button } from "react-bootstrap";

function EventCard({ event }) {
  const navigate = useNavigate();

  return (
    <Card
      className="h-100 border-0 shadow-sm rounded-4"
      style={{ cursor: "pointer" }}
    >
      {event.image && (
        <Card.Img
          variant="top"
          src={event.image}
          style={{ height: "160px", objectFit: "cover" }}
        />
      )}

      <Card.Body className="d-flex flex-column">
        <Card.Title className="fw-bold">{event.name}</Card.Title>
        <Badge bg="secondary">{event.category_name}</Badge>
        <Badge bg="info" text="dark">
          {event.event_type}
        </Badge>
        {event.price_type === "gratuit" ? (
          <Badge bg="success">Gratuit</Badge>
        ) : (
          <Badge bg="danger">{event.price} €</Badge>
        )}
        <Card.Text>
            <p>L'évènement commencera le : {event.start_date}</p>
            <p>Organiser par : {event.organizer_pseudo}</p>
            <p>Nombre de participant : {event.participants_count} / {event.max_participants}</p>
        </Card.Text>
        <div className="mt-auto pt-3">
          <Button
            variant="primary"
            size="sm"
            className="w-100"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            Voir l'événement
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EventCard;
