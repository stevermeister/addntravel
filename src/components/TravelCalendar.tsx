import React, { useEffect, useRef, useState } from 'react';
import Calendar from 'react-calendar';
import { DateRange } from '../types/dateRange';
import { getDateRangeSeasons } from '../utils/dateUtils';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';

interface TravelCalendarProps {
  onDateRangeChange: (range: DateRange) => void;
  isOpen: boolean;
  onClose: () => void;
}

type Value = Date | [Date | null, Date | null] | null;

const TravelCalendar: React.FC<TravelCalendarProps> = ({ onDateRangeChange, isOpen, onClose }) => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Value>(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      setSelectedDates(null);
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      setIsClosing(false);
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleDateChange = (value: Value) => {
    setSelectedDates(value);
  };

  const handleApply = () => {
    if (
      Array.isArray(selectedDates) &&
      selectedDates.length === 2 &&
      selectedDates[0] instanceof Date &&
      selectedDates[1] instanceof Date
    ) {
      const [startDate, endDate] = selectedDates;
      const availableDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      onDateRangeChange({
        startDate,
        endDate,
        availableDays,
        season: getDateRangeSeasons(startDate, endDate)[0], // Use the first season as primary
      });
      handleClose();
    }
  };

  if (!isOpen && !isClosing) return null;

  const isValidDateRange =
    Array.isArray(selectedDates) &&
    selectedDates.length === 2 &&
    selectedDates[0] instanceof Date &&
    selectedDates[1] instanceof Date;

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-center z-50 ${
        isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
      }`}
    >
      <div
        ref={calendarRef}
        className={`bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 transition-all duration-300 transform ${
          isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Select Travel Dates</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close calendar"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <Calendar
          onChange={handleDateChange}
          value={selectedDates}
          selectRange={true}
          minDate={new Date()}
          className="REACT-CALENDAR"
          next2Label={null}
          prev2Label={null}
          showNeighboringMonth={false}
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!isValidDateRange}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isValidDateRange
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelCalendar;
