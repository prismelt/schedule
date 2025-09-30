import styles from "~/styles/calendar.module.css";

interface CalendarDayKidProps {
  date: Date;
  isPassed: boolean;
  isActive: boolean;
  isEmpty: boolean;
  hasUnfilledRequest: boolean;
  hasFulfilledRequest: boolean;
  onClick: (date: Date) => void;
}

function CalendarDayKid({
  date,
  isPassed,
  isActive,
  isEmpty,
  hasUnfilledRequest,
  hasFulfilledRequest,
  onClick,
}: CalendarDayKidProps) {
  const handleClick = () => {
    onClick(date);
  };

  if (isPassed) {
    return (
      <div className={`${styles.day} ${styles.passed}`}>
        <div className={styles.dayNumber}>{date.getDate()}</div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className={`${styles.day} ${styles.inactive}`}>
        <div className={styles.dayNumber}>{date.getDate()}</div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={styles.day} onClick={handleClick}>
        <div className={styles.dayNumber}>{date.getDate()}</div>
      </div>
    );
  }

  if (hasUnfilledRequest) {
    return (
      <div
        className={`${styles.day} ${styles.unfilledRequest}`}
        onClick={handleClick}
      >
        <div className={styles.dayNumber}>{date.getDate()}</div>
      </div>
    );
  }

  if (hasFulfilledRequest) {
    return (
      <div
        className={`${styles.day} ${styles.fulfilledRequest}`}
        onClick={handleClick}
      >
        <div className={styles.dayNumber}>{date.getDate()}</div>
      </div>
    );
  }

  // Add fallback return for any other cases
  return (
    <div className={styles.day} onClick={handleClick}>
      <div className={styles.dayNumber}>{date.getDate()}</div>
    </div>
  );
}

export default CalendarDayKid;
export type { CalendarDayKidProps };
