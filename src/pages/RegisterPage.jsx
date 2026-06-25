import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authSlice";

const registerSchema = yup.object({
  user_status_id: yup.string().required("Le type de compte est requis"),
  pseudo: yup.string().required("Le pseudo est requis"),
  email: yup.string().email("Email invalide").required("L'email est requis"),
  password: yup.string().min(6, "Le mot de passe doit faire au moins 6 caractères").required("Le mot de passe est requis"),
  avatar: yup.string().required("L'avatar est requis"),
  lastname: yup.string().required("Le nom est requis"),
  firstname: yup.string().required("Le prénom est requis"),
  birthdate: yup.date().typeError("Date invalide").required("La date de naissance est requise"),
  address: yup.string().required("L'adresse est requise"),
  postal_code: yup.string().required("Le code postal est requis"),
  city: yup.string().required("La ville est requise"),
  phone: yup.string().optional(), 
});

function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      user_status_id: "1",
      pseudo: "",
      email: "",
      password: "",
      avatar: "avatar.png",
      lastname: "",
      firstname: "",
      birthdate: "",
      address: "",
      postal_code: "",
      city: "",
      phone: "",
    },
  });

  const onSubmit = async (data) => {
    const formattedDate = new Date(data.birthdate).toISOString().split('T')[0];

    const payload = {
      ...data,
      birthdate: formattedDate,
      avatar: data.avatar, 
      user_status_id: Number(data.user_status_id),    
    };

    try {
      await dispatch(registerUser(payload)).unwrap();
      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur d'inscription:", err);
    }
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card
        className="shadow-sm border-0 rounded-4 p-4"
        style={{ maxWidth: "800px", width: "100%" }}
      >
        <Card.Body>
          <h2 className="fw-bold text-center mb-4">Créer un compte</h2>

          {error && (
            <Alert variant="danger" className="text-center rounded-3">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit(onSubmit)}>
            
            <Row className="g-3 mb-3">
              {/* Type de compte */}
              <Col md={6}>
                <Form.Group controlId="user_status_id">
                  <Form.Label className="fw-semibold text-secondary">Je souhaite m'inscrire en tant que :</Form.Label>
                  <Form.Select 
                    isInvalid={!!errors.user_status_id}
                    {...register("user_status_id")}
                  >
                    <option value="1">👤 Utilisateur standard</option>
                    <option value="2">📅 Organisateur</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.user_status_id?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Champ Avatar dynamique */}
              <Col md={6}>
                <Form.Group controlId="avatar">
                  <Form.Label className="fw-semibold text-secondary">Image d'avatar (Nom du fichier)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex: avatar.png ou mon-image.jpg"
                    isInvalid={!!errors.avatar}
                    {...register("avatar")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.avatar?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group controlId="firstname">
                  <Form.Label className="fw-semibold text-secondary">Prénom</Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.firstname}
                    {...register("firstname")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.firstname?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="lastname">
                  <Form.Label className="fw-semibold text-secondary">Nom</Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.lastname}
                    {...register("lastname")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.lastname?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group controlId="pseudo">
                  <Form.Label className="fw-semibold text-secondary">Pseudo</Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.pseudo}
                    {...register("pseudo")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.pseudo?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="birthdate">
                  <Form.Label className="fw-semibold text-secondary">Date de naissance</Form.Label>
                  <Form.Control
                    type="date"
                    isInvalid={!!errors.birthdate}
                    {...register("birthdate")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.birthdate?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="address" className="mb-3">
              <Form.Label className="fw-semibold text-secondary">Adresse</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: 10 rue de Paris"
                isInvalid={!!errors.address}
                {...register("address")}
              />
              <Form.Control.Feedback type="invalid">
                {errors.address?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Group controlId="postal_code">
                  <Form.Label className="fw-semibold text-secondary">Code Postal</Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.postal_code}
                    {...register("postal_code")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.postal_code?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group controlId="city">
                  <Form.Label className="fw-semibold text-secondary">Ville</Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.city}
                    {...register("city")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.city?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label className="fw-semibold text-secondary">Email</Form.Label>
                  <Form.Control
                    type="email"
                    isInvalid={!!errors.email}
                    {...register("email")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="phone">
                  <Form.Label className="fw-semibold text-secondary">Téléphone (Optionnel)</Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.phone}
                    {...register("phone")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="password" className="mb-4">
              <Form.Label className="fw-semibold text-secondary">Mot de passe</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  isInvalid={!!errors.password}
                  {...register("password")}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted password-icon position-absolute end-0 top-50 translate-middle-y me-3"
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? "🙉" : "🙈"}
                </span>
              </div>
              {errors.password && (
                <div className="invalid-feedback d-block fw-bold mt-1">
                  {errors.password.message}
                </div>
              )}
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-100 mt-2 rounded-pill fw-bold py-2"
              disabled={status === "pending"}
            >
              {status === "pending" ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Création en cours...
                </>
              ) : (
                "S'inscrire"
              )}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <p className="mb-0">
              Déjà un compte ? <Link to="/login" className="text-decoration-none">Se connecter</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RegisterPage;