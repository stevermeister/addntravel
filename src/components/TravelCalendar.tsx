import React from 'react';
import Calendar from 'react-calendar';
import { DateRange } from '../types/date';
import 'react-calendar/dist/Calendar.css';

interface TravelCalendarProps {
  onDateRangeChange: (range: DateRange) => void;
  isOpen: boolean;
  onClose: () => void;
}

type Value = Date | [Date | null, Date | null] | null;

const TravelCalendar: React.FC<TravelCalendarProps> = ({ onDateRangeChange, isOpen, onClose }) => {
  const handleDateChange = (value: Value) => {
    if (Array.isArray(value) && value.length === 2 && value[0] instanceof Date && value[1] instanceof Date) {
      const [startDate, endDate] = value;
      const availableDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      onDateRangeChange({
        startDate,
        endDate,
        availableDays,
        seasons: [] 
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg">
        <Calendar
          onChange={handleDateChange}
          selectRange={true}
          minDate={new Date()}
          className="REACT-CALENDAR p-2"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelCalendar;
