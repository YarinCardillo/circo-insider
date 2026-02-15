import styles from './Button.module.css';

export function Button({
  variant = 'gold',
  size = 'default',
  disabled = false,
  onClick,
  children,
  type = 'button',
  ...props
}) {
  const className = [
    styles.btn,
    styles[`btn-${variant}`],
    size === 'small' && styles['btn-small']
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
