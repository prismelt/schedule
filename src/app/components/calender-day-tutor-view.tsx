import styles from "~/styles/calendar.module.css";

interface CalendarDayTutorViewProps {
  date: Date;
  isPassed: boolean;
  isActive: boolean;
  isEmpty: boolean;
  requestsLength: number;
  onClick: (date: Date) => void;
}

function CalendarDayTutorView({
  date,
  isPassed,
  isActive,
  isEmpty,
  requestsLength,
  onClick,
}: CalendarDayTutorViewProps) {
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

  return (
    <div className={styles.day} onClick={handleClick}>
      <div className={styles.dayNumber}>{date.getDate()}</div>
      <div className={styles.dayContent}>
        {requestsLength} request{requestsLength > 1 ? "s" : ""}
      </div>
    </div>
  );
}

export default CalendarDayTutorView;
