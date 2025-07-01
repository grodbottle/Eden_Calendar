
import React from 'react';
import { CustodyTotals, Custodian } from '../types';
import { CUSTODIAN_NAMES, CUSTODIAN_COLORS } from '../constants';

interface TotalsDisplayProps {
  totals: CustodyTotals;
  title: string;
}

const TotalsDisplay: React.FC<TotalsDisplayProps> = ({ totals, title }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-100">{title}</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${CUSTODIAN_COLORS[Custodian.Connar].bg}`}></div>
            <span className="text-gray-700 dark:text-gray-300">{CUSTODIAN_NAMES[Custodian.Connar]}</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">{totals[Custodian.Connar]} days</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${CUSTODIAN_COLORS[Custodian.Emma].bg}`}></div>
            <span className="text-gray-700 dark:text-gray-300">{CUSTODIAN_NAMES[Custodian.Emma]}</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">{totals[Custodian.Emma]} days</span>
        </div>
      </div>
    </div>
  );
};

export default TotalsDisplay;