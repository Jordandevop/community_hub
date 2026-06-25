import { Card, Badge } from "react-bootstrap";

function SkillCard({ skill }) {
    return (
        <Card className="h-100 border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold mb-0">{skill.title}</h5>
                    <Badge bg="success">{skill.daily_price} € / J</Badge>
                </div>
                <p className="text-muted small mb-3">{skill.description}</p>
                <div className="small text-muted">
                    <div>👤 {skill.pseudo}</div>
                    {skill.city && <div>📍 {skill.city}</div>}
                </div>
            </Card.Body>
        </Card>
    );
}

export default SkillCard;