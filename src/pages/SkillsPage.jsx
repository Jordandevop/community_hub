import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSkills } from "../features/skills/skillsSlice";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import SkillCard from "../components/skills/SkillCard";

function SkillsPage() {
  const dispatch = useDispatch();
  const { skills, status } = useSelector((state) => state.skills);

  useEffect(() => {
    dispatch(fetchSkills());
  }, [dispatch]);

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4">🎯 Compétences disponibles</h2>
      {status === "loading" ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : skills.length > 0 ? (
        <Row className="g-4">
          {skills.map((skill) => (
            <Col md={4} key={skill.id}>
              <SkillCard skill={skill} />
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-muted text-center py-5">
          Aucune compétence disponible pour le moment.
        </p>
      )}
    </Container>
  );
}

export default SkillsPage;
