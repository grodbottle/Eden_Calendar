
import { Custodian } from './types';

export const CUSTODIAN_NAMES: { [key in Custodian]: string } = {
  [Custodian.Unassigned]: 'Unassigned',
  [Custodian.Connar]: 'Connar',
  [Custodian.Emma]: 'Emma',
};

export const CUSTODIAN_COLORS: { [key in Custodian]: { bg: string; text: string; border: string } } = {
  [Custodian.Unassigned]: { bg: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-200 dark:border-gray-600' },
  [Custodian.Connar]: { bg: 'bg-blue-300 hover:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600', text: 'text-blue-900 dark:text-blue-50', border: 'border-blue-400 dark:border-blue-500' },
  [Custodian.Emma]: { bg: 'bg-pink-300 hover:bg-pink-400 dark:bg-pink-500 dark:hover:bg-pink-600', text: 'text-pink-900 dark:text-pink-50', border: 'border-pink-400 dark:border-pink-500' },
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const QUARTERS: { name: string; months: number[] }[] = [
    { name: 'Q1', months: [0, 1, 2] },
    { name: 'Q2', months: [3, 4, 5] },
    { name: 'Q3', months: [6, 7, 8] },
    { name: 'Q4', months: [9, 10, 11] },
];