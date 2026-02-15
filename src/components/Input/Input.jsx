import styles from './Input.module.css';

export function Input({
  placeholder = '',
  maxLength,
  value,
  onChange,
  onKeyPress,
  autoComplete = 'off',
  ...props
}) {
  return (
    <input
      type="text"
      className={styles.input}
      placeholder={placeholder}
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      autoComplete={autoComplete}
      {...props}
    />
  );
}
