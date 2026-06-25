import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  updateEvent,
  fetchEventById,
  fetchCategories,
} from "../features/events/eventsSlice";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";

const eventSchema = yup.object({
  name: yup.string().required("Le nom est requis"),
  event_category_id: yup.number().required("Indiquer la catégorie"),
  event_type: yup.string().required("Indiquer le type d'événement"),
  price_type: yup.string().required("Indiquer si gratuit ou payant"),
  price: yup.number().when("price_type", {
    is: "payant",
    then: (schema) => schema
        .typeError("Le prix doit être un nombre")
        .positive()
        .required("Le prix est requis"),
    otherwise: (schema) => schema
        .transform((value) => (isNaN(value) ? null : value))
        .nullable()
        .optional(),
}),
  max_participants: yup
    .number()
    .typeError("Cela doit être un nombre")
    .positive()
    .required("Indiquer le nombre maximum"),
  introduction: yup.string().required("Une introduction est requise"),
  image: yup.string().optional(),
  start_date: yup.string().required("Indiquer la date de début"),
  end_date: yup
    .string()
    .required("La date de fin est requise")
    .test(
      "after-start",
      "La date de fin doit être après la date de début",
      function (value) {
        const { start_date } = this.parent;
        if (!start_date || !value) return true;
        return new Date(value) > new Date(start_date);
      },
    ),
});

function EditEventPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { current, categories, status } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchEventById(id));
    dispatch(fetchCategories());
  }, [dispatch, id]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      event_type: "presentiel",
      price_type: "gratuit",
      image: "",
    },
  });

  useEffect(() => {
    if (current && current.id === Number(id)) {
      reset({
        name: current.name,
        event_category_id: current.event_category_id,
        event_type: current.event_type,
        price_type: current.price_type,
        price: current.price ? Number(current.price) : null,
        max_participants: current.max_participants,
        start_date: current.start_date?.replace(" ", "T"),
        end_date: current.end_date?.replace(" ", "T"),
        image: current.image || "",
        introduction: current.introduction,
      });
    } 
  }, [current, id, reset]);

  const priceType = watch("price_type");

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        event_id: Number(id),
        start_date: data.start_date.replace("T", " "),
        end_date: data.end_date.replace("T", " "),
      };
      await dispatch(updateEvent(payload)).unwrap();
      navigate(`/events/${id}`);
    } catch (error) {
      console.error("Erreur modification événement", error);
    }
  };

  if (status === "loading" || !current) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="py-5">
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <h4 className="fw-bold mb-4">✏️ Modifier l'événement</h4>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3 mb-3">
              <Col md={8}>
                <Form.Group controlId="name">
                  <Form.Label className="fw-semibold text-secondary small">
                    Titre
                  </Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.name}
                    {...register("name")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="event_category_id">
                  <Form.Label className="fw-semibold text-secondary small">
                    Catégorie
                  </Form.Label>
                  <Form.Select
                    isInvalid={!!errors.event_category_id}
                    {...register("event_category_id")}
                  >
                    <option value="">-- Choisir --</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.event_category_id?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col md={3}>
                <Form.Group controlId="event_type">
                  <Form.Label className="fw-semibold text-secondary small">
                    Type
                  </Form.Label>
                  <Form.Select
                    isInvalid={!!errors.event_type}
                    {...register("event_type")}
                  >
                    <option value="presentiel">Présentiel</option>
                    <option value="distanciel">Distanciel</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="price_type">
                  <Form.Label className="fw-semibold text-secondary small">
                    Statut
                  </Form.Label>
                  <Form.Select
                    isInvalid={!!errors.price_type}
                    {...register("price_type")}
                  >
                    <option value="gratuit">Gratuit</option>
                    <option value="payant">Payant</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              {priceType === "payant" && (
                <Col md={3}>
                  <Form.Group controlId="price">
                    <Form.Label className="fw-semibold text-secondary small">
                      Prix (€)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      isInvalid={!!errors.price}
                      {...register("price")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.price?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              <Col md={3}>
                <Form.Group controlId="max_participants">
                  <Form.Label className="fw-semibold text-secondary small">
                    Participants max
                  </Form.Label>
                  <Form.Control
                    type="number"
                    isInvalid={!!errors.max_participants}
                    {...register("max_participants")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.max_participants?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group controlId="start_date">
                  <Form.Label className="fw-semibold text-secondary small">
                    Date de début
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    isInvalid={!!errors.start_date}
                    {...register("start_date")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.start_date?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="end_date">
                  <Form.Label className="fw-semibold text-secondary small">
                    Date de fin
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    isInvalid={!!errors.end_date}
                    {...register("end_date")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.end_date?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col md={4}>
                <Form.Group controlId="image">
                  <Form.Label className="fw-semibold text-secondary small">
                    Image (optionnel)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex: event.jpg"
                    {...register("image")}
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group controlId="introduction">
                  <Form.Label className="fw-semibold text-secondary small">
                    Introduction
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    isInvalid={!!errors.introduction}
                    {...register("introduction")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.introduction?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => navigate(`/events/${id}`)}
              >
                Annuler
              </Button>
              <Button type="submit" variant="success">
                Enregistrer les modifications
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EditEventPage;
