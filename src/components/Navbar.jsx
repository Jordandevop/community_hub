import {
  Container,
  Nav,
  Navbar as BootstrapNavbar,
  Image,
  Button,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/theme/themeSlice";

function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  return (
    <BootstrapNavbar
      bg="primary"
      data-bs-theme="dark"
      expand="lg"
      className="shadow-sm"
    >
      <Container>
        <BootstrapNavbar.Brand as={NavLink} to="/">
          Community Hub
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="main-navbar" />

        <BootstrapNavbar.Collapse id="main-navbar">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={NavLink} to="/">
              Accueil
            </Nav.Link>
            <Nav.Link as={NavLink} to="/skills">
               Compétences
            </Nav.Link>
            <Nav.Link as={NavLink} to="/events">
               Événements
            </Nav.Link>

            <Nav.Link as={NavLink} to="/contact">
              Contact
            </Nav.Link>
            {((user?.is_premium && user?.user_status_id === 2) ||
              user?.user_status_id === 3) && (
              <Nav.Link as={NavLink} to="/events/create">
                ➕ Créer un événement
              </Nav.Link>
            )}

            {user ? (
              <Nav.Link
                as={NavLink}
                to="/dashboard"
                className="fw-bold d-flex align-items-center gap-2"
              >
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    roundedCircle
                    style={{
                      width: "30px",
                      height: "30px",
                      objectFit: "cover",
                      backgroundColor: "white",
                    }}
                    alt="Avatar"
                  />
                ) : (
                  <span>👤</span>
                )}
                Mon Profil
              </Nav.Link>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/register">
                  Inscription
                </Nav.Link>
                <Nav.Link as={NavLink} to="/login">
                  Connexion
                </Nav.Link>
              </>
            )}
          </Nav>

          <Button
            variant={mode === "light" ? "outline-dark" : "outline-light"}
            onClick={() => dispatch(toggleTheme())}
            className="rounded-circle ms-3 d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
            title="Changer de thème"
          >
            {mode === "light" ? "🌙" : "☀️"}
          </Button>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
