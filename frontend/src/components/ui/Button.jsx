export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
  };
  return (
    <button className={`btn ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
