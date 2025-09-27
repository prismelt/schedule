"use client";

import { useState } from "react";
import styles from "./calendar.module.css";

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onClick: (date: Date) => void;
}

function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  onClick,
}: CalendarDayProps) {
  return (
    <div
      className={`${styles.day} ${!isCurrentMonth ? styles.otherMonth : ""} ${isToday ? styles.today : ""} ${isSelected ? styles.selected : ""}`}
      onClick={() => onClick(date)}
    >
      {date.getDate()}
    </div>
  );
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  const maxDate = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );

  const canGoNext =
    currentDate.getMonth() < maxDate.getMonth() ||
    currentDate.getFullYear() < maxDate.getFullYear();
  const canGoPrev =
    currentDate.getMonth() >= today.getMonth() &&
    currentDate.getFullYear() >= today.getFullYear();

  const goToPreviousMonth = () => {
    if (canGoPrev) {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
      );
    }
  };

  const goToNextMonth = () => {
    if (canGoNext) {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      );
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button
          onClick={goToPreviousMonth}
          disabled={!canGoPrev}
          className={styles.navButton}
        >
          ←
        </button>
        <h2 className={styles.monthYear}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className={styles.navButton}
        >
          →
        </button>
      </div>

      <div className={styles.weekDays}>
        {weekDays.map((day) => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {getDaysInMonth().map((date, index) => (
          <CalendarDay
            key={index}
            date={date}
            isCurrentMonth={date.getMonth() === currentDate.getMonth()}
            isToday={date.toDateString() === today.toDateString()}
            isSelected={selectedDate?.toDateString() === date.toDateString()}
            onClick={handleDayClick}
          />
        ))}
      </div>
    </div>
  );
}
