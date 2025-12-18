import "./ui.css";

function PixelButton({
  children,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  ...props
}) {
  const classes = [
    "pixel-btn",
    variant === "secondary" ? "pixel-btn-secondary" : "pixel-btn-primary",
    fullWidth ? "pixel-btn-full" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

export default PixelButton;
