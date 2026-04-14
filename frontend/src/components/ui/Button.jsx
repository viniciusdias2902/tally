const variants = {
  primary:
    "bg-accent text-white shadow-sm hover:bg-accent-hover focus-visible:ring-accent/40",
  secondary:
    "bg-bg-elevated text-text-primary border border-border shadow-sm hover:bg-bg-secondary focus-visible:ring-border",
  danger:
    "bg-danger text-white shadow-sm hover:bg-danger-hover focus-visible:ring-danger/40",
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
