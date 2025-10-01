"use client";

import { useState } from "react";
import styles from "~/styles/calendar.module.css";
import { api } from "~/trpc/react";
import CalendarDayTutorPost from "./calender-day-tutor-post";
import PopupTutorPost from "./popup-tutor-post";
import { useSession } from "next-auth/react";

function Calendar() {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { data: requests } =
    api.tutorView.getAllFutureRequestRelative.useQuery();

  const today = new Date();
  const maxDate = new Date(
    today.getFullYear(),
    today.getMonth() + 1 + 1,
    today.getDate(),
  );

  const canGoNext =
    currentDate.getMonth() < maxDate.getMonth() + 1 ||
    currentDate.getFullYear() < maxDate.getFullYear();
  const canGoPrev =
    currentDate.getMonth() + 1 >= today.getMonth() + 1 &&
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

  const isEmpty = (date: Date) => {
    if (!requests) return true;
    const targetDateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return !requests.some((request) => {
      const requestDate = new Date(request.date);
      const requestDateString = `${requestDate.getFullYear()}-${String(requestDate.getMonth() + 1).padStart(2, "0")}-${String(requestDate.getDate()).padStart(2, "0")}`;
      return requestDateString === targetDateString;
    });
  };

  const getAllRequestFor = (date: Date) => {
    if (!requests || !session?.user?.id) return [];
    if (isEmpty(date)) return [];
    const targetDateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return requests.filter((request) => {
      const requestDate = new Date(request.date);
      const requestDateString = `${requestDate.getFullYear()}-${String(requestDate.getMonth() + 1).padStart(2, "0")}-${String(requestDate.getDate()).padStart(2, "0")}`;
      return (
        requestDateString === targetDateString &&
        !request.fulfillerIdArray.includes(session.user.id)
      );
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
          <CalendarDayTutorPost
            key={index}
            date={date}
            isPassed={date < today}
            isActive={![0, 1, 6].includes(date.getDay())}
            isEmpty={isEmpty(date)}
            requestsLength={getAllRequestFor(date).length}
            onClick={handleDayClick}
          />
        ))}
      </div>

      {selectedDate && (
        <PopupTutorPost
          date={selectedDate}
          request={getAllRequestFor(selectedDate)}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default Calendar;
