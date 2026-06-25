import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../features/users/usersSlice";
import { sendContactRequest } from "../features/contacts/contactsSlice";

export default function UsersPage() {
  const dispatch = useDispatch();
  const { list: users, status, error } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleAddContact = async (receiverId) => {
    try {
      await dispatch(sendContactRequest(receiverId)).unwrap();
      setSuccessMsg("Demande de contact envoyée avec succès !");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Erreur lors de la demande de contact :", err);
    }
  };

  const filteredUsers = users?.filter(u => u.id !== currentUser?.id) || [];

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold">La Communauté</h2>
        <p className="text-muted">Découvre les autres membres et agrandis ton réseau.</p>
      </div>

      {successMsg && (
        <Alert variant="success" className="text-center shadow-sm">
          {successMsg}
        </Alert>
      )}

      {status === 'loading' ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">{error}</Alert>
      ) : filteredUsers.length > 0 ? (
        <Row className="g-4">
          {filteredUsers.map((member) => (
            <Col md={4} lg={3} key={member.id}>
              <Card className="h-100 border-0 shadow-sm text-center p-3 rounded-4">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div 
                    className="bg-light rounded-circle mb-3 d-flex align-items-center justify-content-center" 
                    style={{ width: "80px", height: "80px", fontSize: "2rem" }}
                  >
                    {member.avatar && member.avatar !== "avatar.png" ? (
                      <img src={member.avatar} alt="avatar" className="img-fluid rounded-circle" />
                    ) : (
                      "👤"
                    )}
                  </div>
                  
                  <h5 className="fw-bold mb-1">{member.pseudo}</h5>
                  <p className="text-muted small mb-2">
                    {member.firstname} {member.lastname}
                  </p>
                  
                  <Badge bg={member.user_status_id === 2 ? "primary" : "secondary"} className="mb-3">
                    {member.user_status_id === 2 ? "Organisateur" : "Membre"}
                  </Badge>

                  <div className="mt-auto w-100">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="w-100 rounded-pill fw-bold"
                      onClick={() => handleAddContact(member.id)}
                    >
                      + Ajouter aux contacts
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-muted text-center py-5">Aucun autre membre n'est inscrit pour le moment.</p>
      )}
    </Container>
  );
}