import PropTypes from 'prop-types';

export default function ServiceCard({ icon, title, description, color = 'var(--primary)' }) {
    return (
        <div className="service-card">
            <div className="icon-box">
                <i className={icon} style={{ color }}></i>
            </div>
            <h3>{title}</h3>
            <p className="text-muted">{description}</p>
        </div>
    );
}

ServiceCard.propTypes = {
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    color: PropTypes.string
};
