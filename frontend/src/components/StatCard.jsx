function StatCard({
  icon: Icon,
  label,
  value,
  description,
  tone = "blue",
}) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-icon">
        <Icon size={21} />
      </div>

      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </div>
  );
}

export default StatCard;
