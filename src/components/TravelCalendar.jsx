import React, { useState, useRef, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getSeasonFromDateRange } from '../utils/date';

const TravelCalendar = ({ onDateRangeChange, isOpen, onClose }) => {
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleDateChange = (value) => {
    setDateRange(value);
    
    if (Array.isArray(value) && value.length === 2) {
      const [start, end] = value;
      const daysDifference = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const seasons = getSeasonFromDateRange(start, end);
      onDateRangeChange({
        startDate: start,
        endDate: end,
        availableDays: daysDifference,
        seasons: Array.isArray(seasons) ? seasons : [seasons]
      });
      onClose();
    }
  };

  const formatDateRange = () => {
    if (!Array.isArray(dateRange) || dateRange.length !== 2) return '';
    
    const [start, end] = dateRange;
    const options = { month: 'short', day: 'numeric' };
    const startStr = start.toLocaleDateString(undefined, options);
    const endStr = end.toLocaleDateString(undefined, options);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    return `${startStr} - ${endStr} (${days} days)`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="absolute right-0 top-12 z-50 bg-white rounded-lg shadow-lg p-4"
      ref={calendarRef}
    >
      <Calendar
        onChange={handleDateChange}
        value={dateRange}
        selectRange={true}
        className="w-full text-sm border-0 shadow-none"
        tileClassName="text-sm p-1"
        prevLabel="‹"
        nextLabel="›"
        prev2Label={null}
        next2Label={null}
        minDetail="month"
        maxDetail="month"
        minDate={new Date()}
        calendarType="gregory"
      />
    </div>
  );
};

export default TravelCalendar;
