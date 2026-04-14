const variants = {
  primary:
    "bg-accent text-white hover:bg-accent-hover focus-visible:ring-accent/50",
  secondary:
    "bg-bg-secondary text-text-primary border border-border hover:bg-border focus-visible:ring-border",
  danger:
    "bg-danger text-white hover:bg-danger-hover focus-visible:ring-danger/50",
  ghost:
    "text-text-secondary hover:bg-bg-secondary hover:text-text-primary",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
