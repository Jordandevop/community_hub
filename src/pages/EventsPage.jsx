import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, fetchEvents } from "../features/events/eventsSlice";
import { useNavigate } from "react-router-dom";
import EventCard from "../components/events/EventCard";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";

function EventsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, categories, status } = useSelector((state) => state.events);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    dispatch(fetchEvents(filters));
    dispatch(fetchCategories());
  }, [dispatch, filters]);
  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">🎉 Les Événements</h2>
      </div>
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3">
          <Row className="g-2 align-items-center">
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Rechercher..."
                value={filters.q || ""}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.category_id || ""}
                onChange={(e) =>
                  setFilters({ ...filters, category_id: e.target.value })
                }
              >
                <option value="">Toutes catégories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.price_type || ""}
                onChange={(e) =>
                  setFilters({ ...filters, price_type: e.target.value })
                }
              >
                <option value="">Gratuit / Payant</option>
                <option value="gratuit">Gratuit</option>
                <option value="payant">Payant</option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Select
                value={filters.date_filter || ""}
                onChange={(e) =>
                  setFilters({ ...filters, date_filter: e.target.value })
                }
              >
                <option value="">Tous les events</option>
                <option value="upcoming">À venir</option>
                <option value="past">Passés</option>
              </Form.Select>
            </Col>
            <Col md={1}>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setFilters({})}
              >
                ✕
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {status === "loading" ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : list.length > 0 ? (
        <Row className="g-4">
          {list.map((event) => (
            <Col md={4} key={event.id}>
              <EventCard event={event} />
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-muted text-center py-5">
          Aucun événement pour le moment.
        </p>
      )}
    </Container>
  );
}

export default EventsPage;
