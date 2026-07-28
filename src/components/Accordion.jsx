import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ items }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleIndex = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto w-full">
      {items.map((item, idx) => {
        const isOpen = activeIndex === idx;

        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* Trigger Button */}
            <button
              onClick={() => toggleIndex(idx)}
              className="w-full px-6 py-5 flex justify-between items-center text-left font-display font-semibold text-slate-800 hover:text-primary-600 transition-colors cursor-pointer"
            >
              <span className="text-sm sm:text-base">{item.question}</span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className={`p-1 rounded-lg bg-slate-50 text-slate-500`}
              >
                <ChevronDown size={18} />
              </motion.div>
            </button>

            {/* Collapsible Content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-50">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
