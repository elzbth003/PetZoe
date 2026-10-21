import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Format a Date object to 'YYYY-MM-DD'
 */
const toIsoDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format 'YYYY-MM-DD' to human-friendly display: "Oct 22, 2026"
 */
const formatDisplayDate = (isoStr) => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length !== 3) return isoStr;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Modern, beautifully-styled DatePicker component
 * Replaces native browser `<input type="date">`
 */
export default function DatePicker({
  value = '',
  onChange,
  min = null,
  max = null,
  placeholder = 'Select date...',
  disabled = false,
  error = null,
  className = '',
  buttonClassName = '',
  id
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial selected date or default to today
  const selectedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length !== 3) return null;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  // Current view year & month in the calendar view
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) return new Date(selectedDate);
    return new Date();
  });

  // When value prop changes, synchronize viewDate
  useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  // Close on outside click & Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    setViewDate(new Date(newYear, viewMonth, 1));
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    setViewDate(new Date(viewYear, newMonth, 1));
  };

  // Build grid of days
  const calendarDays = useMemo(() => {
    const days = [];
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    // Previous month tail
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - 1, daysInPrevMonth - i);
      days.push({ date: d, isCurrentMonth: false, iso: toIsoDate(d) });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const d = new Date(viewYear, viewMonth, i);
      days.push({ date: d, isCurrentMonth: true, iso: toIsoDate(d) });
    }

    // Next month head to complete grid rows
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(viewYear, viewMonth + 1, i);
      days.push({ date: d, isCurrentMonth: false, iso: toIsoDate(d) });
    }

    return days;
  }, [viewYear, viewMonth]);

  const todayIso = useMemo(() => toIsoDate(new Date()), []);

  const isDayDisabled = (iso) => {
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };

  const handleSelectDay = (day) => {
    if (isDayDisabled(day.iso) || disabled) return;
    onChange(day.iso);
    setIsOpen(false);
  };

  const handleTodayClick = () => {
    if (isDayDisabled(todayIso)) return;
    onChange(todayIso);
    setViewDate(new Date());
    setIsOpen(false);
  };

  const handleClearClick = () => {
    onChange('');
    setIsOpen(false);
  };

  // Generate year range for quick dropdown jump (e.g. past 30 years to next 5 years)
  const yearsRange = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const list = [];
    for (let y = currentYear - 35; y <= currentYear + 10; y++) {
      list.push(y);
    }
    return list;
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 text-left transition-all duration-200 select-none
          px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer
          ${
            error
              ? 'bg-rose-50 border border-rose-300 text-rose-900'
              : isOpen
              ? 'bg-white border-blue-500 ring-2 ring-blue-100 text-slate-800 shadow-sm'
              : 'bg-slate-50 hover:bg-white border border-slate-200 text-slate-800'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <CalendarIcon size={15} className="text-slate-400 shrink-0" />
          {value ? (
            <span className="font-semibold text-slate-800 truncate">
              {formatDisplayDate(value)}
            </span>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
        </div>

        {value && !disabled && (
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="p-1 text-slate-300 hover:text-slate-500 transition-colors rounded-full"
            title="Clear date"
          >
            <X size={12} />
          </div>
        )}
      </button>

      {/* Floating Calendar Popup */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 z-50
            bg-white/98 backdrop-blur-md border border-slate-200/90
            rounded-2xl shadow-xl shadow-slate-200/70 p-4 w-72 sm:w-80
            animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          {/* Calendar Header: Month, Year, and Prev/Next Steppers */}
          <div className="flex items-center justify-between gap-1 mb-3">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <select
                value={viewMonth}
                onChange={handleMonthChange}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer pr-6"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={handleYearChange}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer pr-6"
              >
                {yearsRange.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_NAMES.map((day) => (
              <span key={day} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((d, index) => {
              const disabledDay = isDayDisabled(d.iso);
              const isSelected = value === d.iso;
              const isToday = todayIso === d.iso;

              return (
                <button
                  key={index}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelectDay(d)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center text-xs font-medium rounded-xl transition-all
                    ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25'
                        : isToday
                        ? 'border border-blue-400 font-bold text-blue-600 hover:bg-blue-50'
                        : d.isCurrentMonth
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-300 hover:bg-slate-50'
                    }
                    ${disabledDay ? 'opacity-25 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'}
                  `}
                >
                  {d.date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer: Clear & Today */}
          <div className="flex items-center justify-between border-t border-slate-100 mt-3 pt-2 text-xs">
            <button
              type="button"
              onClick={handleClearClick}
              className="text-slate-400 hover:text-rose-500 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleTodayClick}
              disabled={isDayDisabled(todayIso)}
              className="text-blue-600 hover:text-blue-700 font-bold px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Today
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{error}</p>
      )}
    </div>
  );
}
