import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const TravelCalendar = ({ onDateRangeChange }) => {
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDateChange = (value) => {
    setDateRange(value);
    
    if (Array.isArray(value) && value.length === 2) {
      const [start, end] = value;
      const daysDifference = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      onDateRangeChange({
        startDate: start,
        endDate: end,
        availableDays: daysDifference
      });
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Travel Dates</h3>
          {dateRange && (
            <p className="text-sm text-gray-600 mt-1">{formatDateRange()}</p>
          )}
        </div>
        <button className="text-gray-500 hover:text-gray-700 transition-colors">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-4">
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
      )}
    </div>
  );
};

export default TravelCalendar;
