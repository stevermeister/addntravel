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
    <div className="mb-6 bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center cursor-pointer" 
           onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Travel Dates</h3>
          {dateRange && (
            <p className="text-sm text-gray-600 mt-1">{formatDateRange()}</p>
          )}
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-4">
          <Calendar
            onChange={handleDateChange}
            value={dateRange}
            selectRange={true}
            minDate={new Date()}
            className="border-0 w-full"
            tileClassName="rounded-lg"
            prevLabel="◀"
            nextLabel="▶"
            navigationLabel={({ date }) => 
              date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
            }
          />
          <div className="mt-4 text-sm text-gray-600">
            <p>Select your travel dates to see matching destinations</p>
            <ul className="mt-2 list-disc list-inside">
              <li>Short trips: 1-3 days</li>
              <li>Medium trips: 4-7 days</li>
              <li>Long trips: 8+ days</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelCalendar;
