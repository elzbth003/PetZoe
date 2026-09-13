import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Premium Custom Select / Dropdown Component
 * Provides rich option descriptions, tailored icons, smooth animations,
 * and elegant active/focus states to replace standard browser native selects.
 */
export default function CustomSelect({
  label,
  icon: HeaderIcon,
  required = false,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  disabled = false,
  className = '',
  helperText,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
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

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Label Header */}
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
            {HeaderIcon && <HeaderIcon size={14} className="text-primary-500" />}
            {label}
            {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          {selectedOption && (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Selected
            </span>
          )}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full group relative flex items-center justify-between gap-3 text-left
          bg-slate-50/90 hover:bg-white text-slate-800 
          border rounded-2xl px-4 py-3 min-h-[52px]
          transition-all duration-200 shadow-sm
          ${
            isOpen
              ? 'border-primary-500 ring-4 ring-primary-500/10 bg-white shadow-md'
              : 'border-slate-200/90 hover:border-primary-300'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-primary-100/70 text-primary-700 shadow-sm">
                  <selectedOption.icon size={16} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-800 truncate">
                  {selectedOption.label}
                </div>
                {selectedOption.description && (
                  <div className="text-xs text-slate-400 truncate">
                    {selectedOption.description}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-slate-400 min-w-0">
              {HeaderIcon && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-400 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600">
                  <HeaderIcon size={16} />
                </div>
              )}
              <span className="text-sm font-medium text-slate-400 truncate">{placeholder}</span>
            </div>
          )}
        </div>

        {/* Chevron with gentle interactive container */}
        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 
            transition-all duration-200 
            ${
              isOpen
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-slate-200/60 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600'
            }`}
        >
          <ChevronDown
            size={15}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 min-w-full sm:min-w-[320px] mt-2 z-50
            bg-white/98 backdrop-blur-xl border border-slate-200/90 
            rounded-2xl shadow-2xl shadow-slate-300/40 overflow-hidden 
            p-1.5 divide-y divide-slate-100/60
            animate-in fade-in slide-in-from-top-2 duration-150 max-h-80 overflow-y-auto"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const OptIcon = opt.icon;

            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`group flex items-start justify-between gap-3 p-3 rounded-xl cursor-pointer 
                  transition-all duration-150 my-0.5
                  ${
                    isSelected
                      ? 'bg-primary-50/90 text-primary-900 font-medium shadow-xs border border-primary-200/60'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {OptIcon && (
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors mt-0.5
                        ${
                          isSelected
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-700'
                        }`}
                    >
                      <OptIcon size={16} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          isSelected
                            ? 'font-bold text-primary-900'
                            : 'font-semibold text-slate-800 group-hover:text-primary-900'
                        }`}
                      >
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.description && (
                      <p className="text-xs text-slate-400 group-hover:text-slate-500 leading-snug mt-0.5">
                        {opt.description}
                      </p>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-slate-400 mt-1 pl-1">{helperText}</p>
      )}
    </div>
  );
}
