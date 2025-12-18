import "./ui.css";

function PixelPanel({ title, subtitle, children, className = "" }) {
  return (
    <div className={`pixel-panel ${className}`}>
      {(title || subtitle) && (
        <header className="pixel-panel-header">
          {title && <h2>{title}</h2>}
          {subtitle && <p className="pixel-panel-subtitle">{subtitle}</p>}
        </header>
      )}
      {children}
    </div>
  );
}

export default PixelPanel;
