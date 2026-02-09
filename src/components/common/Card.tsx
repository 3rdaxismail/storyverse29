/**
 * Card - Reusable card wrapper component
 * Provides consistent background, padding, border, and radius
 * for all card-based sections in the app
 */
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  const cardClasses = className 
    ? `${styles.card} ${className}` 
    : styles.card;

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
}
