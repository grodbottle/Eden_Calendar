
import { Custodian, CustodyData, CustodyTotals } from '../types';
import { QUARTERS } from '../constants';

export const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  const day = new Date(year, month, 1).getDay(); // Sunday is 0, Monday is 1, etc.
  // Adjust so that Monday is 0 and Sunday is 6
  return (day === 0) ? 6 : day - 1;
};

export const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const calculateTotals = (
  custodyData: CustodyData,
  dates: string[]
): CustodyTotals => {
  const totals: CustodyTotals = {
    [Custodian.Connar]: 0,
    [Custodian.Emma]: 0,
    [Custodian.Unassigned]: 0,
  };

  dates.forEach(dateKey => {
    const dayData = custodyData[dateKey];
    const custodian = dayData ? dayData.custodian : Custodian.Unassigned;
    if (totals[custodian] !== undefined) {
      totals[custodian]++;
    }
  });

  return totals;
};

export const getMonthDateKeys = (year: number, month: number): string[] => {
    const days = getDaysInMonth(year, month);
    return days.map(formatDateKey);
}

export const getQuarterDateKeys = (year: number, quarterIndex: number): string[] => {
    const quarter = QUARTERS[quarterIndex];
    if (!quarter) return [];
    return quarter.months.flatMap(month => getMonthDateKeys(year, month));
};

export const getYearDateKeys = (year: number): string[] => {
    return Array.from({ length: 12 }).flatMap((_, month) => getMonthDateKeys(year, month));
}