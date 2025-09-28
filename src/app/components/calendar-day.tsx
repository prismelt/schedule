import styles from "./calendar.module.css";

interface CalendarDayProps {
  date: Date;
  isPassed: boolean;
  isActive: boolean;
  isRegistered: boolean;
  partnerIsRegistered: boolean;
  onClick: (date: Date) => void;
}

function CalendarDay({
  date,
  isPassed,
  isActive,
  isRegistered,
  partnerIsRegistered,
  onClick,
}: CalendarDayProps) {
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

  return (
    <div
      className={`${styles.day} ${isRegistered && partnerIsRegistered ? styles.bothRegistered : ""} ${isRegistered && !partnerIsRegistered ? styles.selfRegistered : ""} ${!isRegistered && partnerIsRegistered ? styles.partnerRegistered : ""}`}
      onClick={handleClick}
    >
      <div className={styles.dayNumber}>{date.getDate()}</div>
    </div>
  );
}

export default CalendarDay;
export type { CalendarDayProps };
