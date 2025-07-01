
import React, { useMemo, useState } from 'react';
import { CustodyData, Custodian } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, formatDateKey, calculateTotals, getMonthDateKeys } from '../utils/dateUtils';
import { MONTH_NAMES, WEEKDAY_NAMES, CUSTODIAN_COLORS } from '../constants';
import TotalsDisplay from './TotalsDisplay';
import NotesModal from './NotesModal';

interface MonthViewProps {
  year: number;
  month: number;
  custodyData: CustodyData;
  onDayClick: (dateKey: string) => void;
  onUpdateNotes: (dateKey: string, notes: string) => void;
  isExportMode?: boolean;
}

const MonthView: React.FC<MonthViewProps> = ({ year, month, custodyData, onDayClick, onUpdateNotes, isExportMode = false }) => {
  const [editingNoteFor, setEditingNoteFor] = useState<string | null>(null);

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const firstDayOfMonth = useMemo(() => getFirstDayOfMonth(year, month), [year, month]);
  
  const monthDateKeys = useMemo(() => getMonthDateKeys(year, month), [year, month]);
  const monthlyTotals = useMemo(() => calculateTotals(custodyData, monthDateKeys), [custodyData, monthDateKeys]);

  const gridClass = isExportMode ? 'grid-cols-7' : 'grid-cols-7';
  const dayBaseClass = 'relative aspect-square flex items-center justify-center border text-sm font-medium transition-colors duration-150';

  const handleOpenNoteEditor = (e: React.MouseEvent, dateKey: string) => {
    e.stopPropagation(); // prevent day click from firing when clicking the icon
    setEditingNoteFor(dateKey);
  }

  const handleSaveNote = (notes: string) => {
    if (editingNoteFor) {
        onUpdateNotes(editingNoteFor, notes);
    }
  };

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg ${isExportMode ? '' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {MONTH_NAMES[month]} {year}
          </h2>
          {!isExportMode && <TotalsDisplay totals={monthlyTotals} title="Monthly Totals" />}
        </div>
        <div className={`grid ${gridClass} gap-px`}>
          {WEEKDAY_NAMES.map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2 text-xs">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="border-transparent"></div>
          ))}
          {daysInMonth.map(date => {
            const dateKey = formatDateKey(date);
            const dayData = custodyData[dateKey];
            const custodian = dayData?.custodian || Custodian.Unassigned;
            const hasNote = !!dayData?.notes;
            const colors = CUSTODIAN_COLORS[custodian];

            return (
              <button
                key={dateKey}
                onClick={() => !isExportMode && onDayClick(dateKey)}
                className={`${dayBaseClass} ${colors.bg} ${colors.text} ${colors.border} ${!isExportMode ? 'cursor-pointer' : 'cursor-default'} rounded-md group`}
                aria-label={`Date ${date.getDate()}, Custodian ${custodian}, ${hasNote ? 'has notes' : 'no notes'}`}
              >
                <span>{date.getDate()}</span>
                {!isExportMode && (
                  <button 
                      onClick={(e) => handleOpenNoteEditor(e, dateKey)} 
                      className="absolute top-1 right-1 p-1 rounded-full bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 opacity-50 group-hover:opacity-100 focus:opacity-100 focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-opacity"
                      aria-label={`Edit note for ${dateKey}`}
                      type="button"
                  >
                    {hasNote ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-notebook-pen text-gray-800 dark:text-white"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M18.4 2.6a2.17 2.17 0 0 1 3 3L16 11l-4 1 1-4Z"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle text-gray-800 dark:text-white"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                    )}
                  </button>
                )}
              </button>
            );
          })}
        </div>
        {isExportMode && (
           <div className="mt-4">
              <TotalsDisplay totals={monthlyTotals} title="Monthly Totals" />
           </div>
        )}
      </div>

      <NotesModal
        isOpen={!!editingNoteFor}
        date={editingNoteFor || ''}
        initialNotes={editingNoteFor ? (custodyData[editingNoteFor]?.notes || '') : ''}
        onSave={handleSaveNote}
        onClose={() => setEditingNoteFor(null)}
      />
    </>
  );
};

export default MonthView;