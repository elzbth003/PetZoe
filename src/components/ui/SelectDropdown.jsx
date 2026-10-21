import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Modern, styled Dropdown Select component to replace native browser <select>
 * Features:
 * - Rounded corners, elevation shadows, backdrop blur
 * - Icon support (leading icon for trigger and each option)
 * - Click-outside and Escape key handling
 * - Clean active states with checkmarks
 */
export default function SelectDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  icon: LeadingIcon,
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  error = null,
  size = 'md', // 'sm' | 'md'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options into { value, label, icon, badge, color }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const isSmall = size === 'sm';

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 text-left transition-all duration-200 select-none
          ${
            isSmall
              ? 'px-3 py-1.5 rounded-xl text-xs font-semibold'
              : 'px-3.5 py-2.5 rounded-xl text-xs font-medium'
          }
          ${
            error
              ? 'bg-rose-50 border border-rose-300 text-rose-900'
              : isOpen
              ? 'bg-white border-blue-500 ring-2 ring-blue-100 text-slate-800 shadow-sm'
              : 'bg-slate-50 hover:bg-white border border-slate-200 text-slate-800'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {LeadingIcon && (
            <LeadingIcon
              size={isSmall ? 13 : 15}
              className="text-slate-400 shrink-0"
            />
          )}

          {selectedOption ? (
            <div className="flex items-center gap-1.5 truncate">
              {selectedOption.icon && (
                <span className="shrink-0">{selectedOption.icon}</span>
              )}
              <span className="truncate font-semibold text-slate-800">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className="ml-1 text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          size={14}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 w-full mt-1.5 z-50
            bg-white/98 backdrop-blur-md border border-slate-200/90
            rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden
            p-1 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto
            ${menuClassName}`}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);

            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer text-xs transition-colors
                  ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium'
                  }`}
              >
                <div className="flex items-center gap-2 truncate flex-1">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                  {opt.badge && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                      {opt.badge}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <Check size={14} className="text-blue-600 shrink-0" strokeWidth={2.5} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-[10px] text-rose-500 font-semibold mt-1 ml-1">{error}</p>
      )}
    </div>
  );
}
