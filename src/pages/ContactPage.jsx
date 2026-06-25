import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const contactSchema = yup.object({
  firstname: yup.string().required("Le prénom est requis"),
  lastname: yup.string().required("Le nom est requis"),
  subject: yup.string().required("Le sujet est requis"),
  message: yup
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .required("Le message est requis"),
});

export default function ContactPage() {
  const { user } = useSelector((state) => state.auth);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Formulaire de contact soumis :", data);
    setSubmitted(true);
    reset();
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>

          <div className="text-center mb-5">
            <h2 className="fw-bold">Nous contacter</h2>
            <p className="text-muted">
              Une question, une suggestion ? Notre équipe te répond dans les plus brefs délais.
            </p>
          </div>

          {submitted && (
            <Alert
              variant="success"
              className="rounded-4 text-center"
              onClose={() => setSubmitted(false)}
              dismissible
            >
              <Alert.Heading>✅ Message envoyé !</Alert.Heading>
              <p className="mb-0">
                Merci pour ton message. Notre équipe te répondra très prochainement.
              </p>
            </Alert>
          )}

          {!submitted && (
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4 p-md-5">
                <Form onSubmit={handleSubmit(onSubmit)} noValidate>

                  <Row className="g-3 mb-3">
                    <Col sm={6}>
                      <Form.Group controlId="firstname">
                        <Form.Label className="fw-semibold small text-secondary">
                          Prénom <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Jean"
                          isInvalid={!!errors.firstname}
                          {...register("firstname")}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.firstname?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group controlId="lastname">
                        <Form.Label className="fw-semibold small text-secondary">
                          Nom <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Dupont"
                          isInvalid={!!errors.lastname}
                          {...register("lastname")}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.lastname?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="subject">
                    <Form.Label className="fw-semibold small text-secondary">
                      Sujet <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ex: Question sur mon abonnement premium"
                      isInvalid={!!errors.subject}
                      {...register("subject")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.subject?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="message">
                    <Form.Label className="fw-semibold small text-secondary">
                      Message <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      placeholder="Décris ta demande en détail..."
                      isInvalid={!!errors.message}
                      {...register("message")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.message?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="rounded-pill fw-semibold"
                      disabled={isSubmitting}
                    >
                      Envoyer le message
                    </Button>
                  </div>

                </Form>
              </Card.Body>
            </Card>
          )}

        </Col>
      </Row>
    </Container>
  );
}
