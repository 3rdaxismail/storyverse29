import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.breadcrumbList}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item.path} className={styles.breadcrumbItem}>
              {!isLast ? (
                <>
                  <Link to={item.path} className={styles.breadcrumbLink}>
                    {item.label}
                  </Link>
                  <span className={styles.separator}>/</span>
                </>
              ) : (
                <span className={styles.breadcrumbCurrent} aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
