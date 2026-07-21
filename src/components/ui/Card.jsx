/**
 * The one "glass card" wrapper — list rows, stat tiles, empty states.
 * `hover` adds the subtle lift-on-hover treatment for clickable cards;
 * leave it off for static content so hover doesn't imply an action that
 * isn't there.
 */
export default function Card({ as: Tag = 'div', hover = false, padding = 'p-5', className = '', children, ...props }) {
  return (
    <Tag
      className={`glass rounded-2xl shadow-elevation-1 ${padding} ${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
