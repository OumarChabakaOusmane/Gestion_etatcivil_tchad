import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

export default function DemandeCard({ icon, title, description, type, iconColor = 'var(--primary)' }) {
    const navigate = useNavigate();

    const handleClick = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { state: { from: `/demande/${type}` } });
        } else {
            navigate(`/demande/${type}`);
        }
    };

    return (
        <div className="demande-item" onClick={handleClick}>
            <i className={`${icon} demande-icon-small`} style={{ color: iconColor }}></i>
            <h3>{title}</h3>
            <p className="text-muted mb-0">{description}</p>
            <div className="mt-3 text-primary fw-bold small">
                Commencer <i className="bi bi-arrow-right ms-1"></i>
            </div>
        </div>
    );
}

DemandeCard.propTypes = {
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    iconColor: PropTypes.string
};
