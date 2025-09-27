"use client";

import styles from "./calendar.module.css";

interface CalendarDayData {
  hasEvent?: boolean;
  eventCount?: number;
  isBooked?: boolean;
  status?: "available" | "busy" | "booked";
}

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  data?: CalendarDayData;
  onClick: (date: Date) => void;
}

export default function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  data,
  onClick,
}: CalendarDayProps) {
  const handleClick = () => {
    if (isCurrentMonth) {
      onClick(date);
    }
  };

  return (
    <div
      className={`${styles.day} ${!isCurrentMonth ? styles.otherMonth : ""} ${isToday ? styles.today : ""} ${isSelected ? styles.selected : ""}`}
      onClick={handleClick}
    >
      <div className={styles.dayNumber}>{date.getDate()}</div>

      {data && isCurrentMonth && (
        <div className={styles.dayContent}>
          {data.hasEvent && <div>📅 {data.eventCount ?? 1}</div>}
          {data.isBooked && <div>✓ Booked</div>}
          {data.status === "busy" && <div>🔴 Busy</div>}
        </div>
      )}
    </div>
  );
}
