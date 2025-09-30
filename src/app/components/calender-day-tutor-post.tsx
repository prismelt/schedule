import styles from "~/styles/calendar.module.css";

interface CalendarDayTutorPostProps {
  date: Date;
  isPassed: boolean;
  isActive: boolean;
  isEmpty: boolean;
  unfulfilledRequestsLength: number;
  onClick: (date: Date) => void;
}

function CalendarDayTutorPost({
  date,
  isPassed,
  isActive,
  isEmpty,
  unfulfilledRequestsLength,
  onClick,
}: CalendarDayTutorPostProps) {
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
    <div
      className={`${styles.day} ${styles.unfulfilledRequest}`}
      onClick={handleClick}
    >
      <div className={styles.dayNumber}>{date.getDate()}</div>
      <div className={styles.dayContent}>
        {unfulfilledRequestsLength} request
        {unfulfilledRequestsLength > 1 ? "s" : ""}
      </div>
    </div>
  );
}

export default CalendarDayTutorPost;
