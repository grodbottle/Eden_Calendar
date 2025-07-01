import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useCustodyData } from './hooks/useCustodyData';
import { calculateTotals, getQuarterDateKeys, getYearDateKeys } from './utils/dateUtils';
import { MONTH_NAMES, QUARTERS, CUSTODIAN_NAMES, CUSTODIAN_COLORS } from './constants';
import { Custodian } from './types';
import MonthView from './components/MonthView';
import TotalsDisplay from './components/TotalsDisplay';

// This is to inform TypeScript about the global variables from the script tags
declare const jspdf: any;
declare const html2canvas: any;
declare const lucide: any;

const ExportLegend: React.FC = () => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-100">Legend</h3>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${CUSTODIAN_COLORS[Custodian.Connar].bg}`}></div>
            <span className="text-gray-700 dark:text-gray-300">{CUSTODIAN_NAMES[Custodian.Connar]}</span>
        </div>
        <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${CUSTODIAN_COLORS[Custodian.Emma].bg}`}></div>
            <span className="text-gray-700 dark:text-gray-300">{CUSTODIAN_NAMES[Custodian.Emma]}</span>
        </div>
      </div>
    </div>
);


const App: React.FC = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth());
  const { custodyData, updateDayCustodian, isLoaded } = useCustodyData();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Initialize Lucide icons on component mount and update
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  });

  const yearlyTotals = useMemo(() => {
    const yearKeys = getYearDateKeys(currentYear);
    return calculateTotals(custodyData, yearKeys);
  }, [custodyData, currentYear]);

  const quarterlyTotals = useMemo(() => {
    return QUARTERS.map((_, index) => {
        const quarterKeys = getQuarterDateKeys(currentYear, index);
        return calculateTotals(custodyData, quarterKeys);
    });
  }, [custodyData, currentYear]);


  const handleExport = useCallback(async (type: 'month' | 'quarter' | 'year', index?: number) => {
    if (typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') {
      alert('PDF generation library is not available.');
      return;
    }
    
    setIsExporting(true);
    const { jsPDF } = jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const contentWidth = pdfWidth - margin * 2;

    const addContentToPdf = async (elementId: string, pageTitle: string) => {
        const content = document.getElementById(elementId);
        if (!content) return;
        
        // Wait for lucide icons to render if necessary
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(content, { scale: 2, backgroundColor: '#f9fafb' });
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * contentWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = margin + 5;
        
        const addNewPage = () => {
          if (pdf.internal.getNumberOfPages() > 1 || pdf.internal.getCurrentPageInfo().pageNumber > 1) {
              pdf.addPage();
          }
          pdf.text(pageTitle, margin, margin);
        }

        addNewPage();
        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
    };

    const exportContainer = document.getElementById('pdf-export-container');
    if (exportContainer) exportContainer.style.display = 'block';

    try {
        if (type === 'month' && selectedMonth !== null) {
            await addContentToPdf(`export-month-${selectedMonth}`, `Custody Report: ${MONTH_NAMES[selectedMonth]} ${currentYear}`);
        } else if (type === 'quarter' && index !== undefined) {
             await addContentToPdf(`export-quarter-${index}`, `Custody Report: ${QUARTERS[index].name} ${currentYear}`);
        } else if (type === 'year') {
             for (let i = 0; i < QUARTERS.length; i++) {
                if(i > 0) pdf.addPage();
                await addContentToPdf(`export-quarter-${i}`, `Custody Report: ${QUARTERS[i].name} ${currentYear}`);
             }
        }
        pdf.save(`custody-report-${type}-${currentYear}${index !== undefined ? '-' + (index+1) : ''}.pdf`);
    } catch (e) {
        console.error("Error exporting PDF:", e);
        alert("An error occurred while exporting the PDF.");
    } finally {
        if (exportContainer) exportContainer.style.display = 'none';
        setIsExporting(false);
    }
  }, [currentYear, selectedMonth]);


  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Loading Calendar...</div>
      </div>
    );
  }

  const renderYearView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MONTH_NAMES.map((name, index) => {
            const monthKeys = getQuarterDateKeys(currentYear, Math.floor(index/3)).filter(k => new Date(k).getMonth() === index);
            const totals = calculateTotals(custodyData, monthKeys);
            return (
                <div key={name} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setSelectedMonth(index)}>
                    <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-3">{name}</h3>
                    <div className="flex justify-around">
                        <div className="text-center">
                            <p className="text-blue-600 dark:text-blue-400 font-semibold">{CUSTODIAN_NAMES[Custodian.Connar]}</p>
                            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{totals[Custodian.Connar]}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-pink-600 dark:text-pink-400 font-semibold">{CUSTODIAN_NAMES[Custodian.Emma]}</p>
                            <p className="text-2xl font-bold text-pink-800 dark:text-pink-200">{totals[Custodian.Emma]}</p>
                        </div>
                    </div>
                </div>
            )
        })}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8 relative">
        {isExporting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                    <p className="text-lg font-semibold">Generating PDF, please wait...</p>
                </div>
            </div>
        )}
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-2">Eden's Custody Calendar</h1>
          <div className="flex items-center justify-center space-x-4 my-4">
            <button onClick={() => setCurrentYear(y => y - 1)} className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              <i data-lucide="chevron-left" className="w-6 h-6"></i>
            </button>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{currentYear}</h2>
            <button onClick={() => setCurrentYear(y => y + 1)} className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              <i data-lucide="chevron-right" className="w-6 h-6"></i>
            </button>
          </div>
        </header>

        <main>
          {selectedMonth !== null ? (
            <div>
              <button onClick={() => setSelectedMonth(null)} className="flex items-center space-x-2 mb-6 text-blue-600 dark:text-blue-400 hover:underline">
                <i data-lucide="arrow-left" className="w-6 h-6"></i>
                <span>Back to Year View</span>
              </button>
              <MonthView year={currentYear} month={selectedMonth} custodyData={custodyData} onDayClick={updateDayCustodian} />
              <button onClick={() => handleExport('month')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">Export Month PDF</button>
            </div>
          ) : (
            <div>
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {QUARTERS.map((q, i) => <TotalsDisplay key={q.name} totals={quarterlyTotals[i]} title={`${q.name} Totals`}/>)}
                </div>
                <div className="mb-8">
                     <TotalsDisplay totals={yearlyTotals} title={`${currentYear} Yearly Totals`} />
                </div>
                 <div className="flex flex-wrap gap-4 mb-8">
                    {QUARTERS.map((q, i) => <button key={q.name} onClick={() => handleExport('quarter', i)} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">Export {q.name} PDF</button>)}
                    <button onClick={() => handleExport('year')} className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition">Export Full Year PDF</button>
                </div>
                {renderYearView()}
            </div>
          )}
        </main>
      </div>
        
      {/* Hidden container for PDF export rendering */}
      <div id="pdf-export-container" style={{ display: 'none', position: 'absolute', left: '-9999px', width: '800px' }}>
          {selectedMonth !== null && (
            <div id={`export-month-${selectedMonth}`} className="p-4 bg-gray-50">
              <MonthView year={currentYear} month={selectedMonth} custodyData={custodyData} onDayClick={() => {}} isExportMode={true} />
              <div className="mt-4"><ExportLegend /></div>
            </div>
          )}
          {QUARTERS.map((q, i) => (
             <div key={`export-q-${i}`} id={`export-quarter-${i}`} className="p-4 bg-gray-50">
                 <h2 className="text-3xl font-bold text-center mb-4">{q.name} {currentYear} Report</h2>
                 <div className="space-y-6">
                    {q.months.map(m => (
                        <MonthView key={m} year={currentYear} month={m} custodyData={custodyData} onDayClick={() => {}} isExportMode={true} />
                    ))}
                 </div>
                 <div className="mt-4 grid grid-cols-2 gap-4">
                    <TotalsDisplay totals={quarterlyTotals[i]} title={`${q.name} Totals`} />
                    <ExportLegend />
                 </div>
             </div>
          ))}
      </div>
    </div>
  );
};

export default App;
