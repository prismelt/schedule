"use client";

import { useState } from "react";
import styles from "./calendar.module.css";
import CalendarDay from "./calendar-day";
import DayModal from "./day-modal";
import { api } from "~/trpc/react";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: userSchedules } = api.schedule.getAll.useQuery();

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

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const closeModal = () => {
    setSelectedDate(null);
  };

  // Check if user is registered for a specific date
  const isUserRegistered = (date: Date) => {
    if (!userSchedules) return false;
    const targetDateString = date.toISOString().split("T")[0]; // "2024-09-26"
    return userSchedules.some((schedule) => {
      const scheduleDate = new Date(schedule.date);
      const scheduleDateString = scheduleDate.toISOString().split("T")[0];
      return scheduleDateString === targetDateString;
    });
  };

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
            isPassed={date < today}
            isActive={![0, 1, 6].includes(date.getDay())}
            isRegistered={isUserRegistered(date)}
            partnerIsRegistered={true} // TODO: implement partner logic
            onClick={handleDayClick}
          />
        ))}
      </div>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          isRegistered={isUserRegistered(selectedDate)}
          partnerIsRegistered={true} // TODO: implement partner logic
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default Calendar;
