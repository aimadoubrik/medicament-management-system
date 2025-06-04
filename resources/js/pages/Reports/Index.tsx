import { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DataTable } from '@/components/data-table';
import AppLayout from '@/layouts/app-layout';
import { PageProps, PaginatedResponse, StockLedgerEntry as StockLedgerEntryType } from '@/types';
import { Head } from '@inertiajs/react';
import { stockLedgerEntryColumns as baseStockLedgerEntryColumns, stockLedgerEntryColumnVisibility } from './table-definition';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Loader2 } from 'lucide-react';

// --- Type Definitions ---
interface MonthlyData {
    month: string;
    received: number; // Or be more specific if they are always numbers
    out: number;
    quantity: number;
}

interface YearlyReportRow {
    medicine_name: string;
    months: MonthlyData[];
}

type YearlyReportData = YearlyReportRow[];

enum ExportFormat {
    PDF = 'pdf',
    EXCEL = 'excel',
}

interface StockLedgerEntriesIndexProps extends PageProps {
    stockLedgerEntries: PaginatedResponse<StockLedgerEntryType>;
}

// Assuming `route` is globally available or imported (e.g., from Ziggy in Laravel)
// If not, you might need to adjust how `route` is accessed or pass it as a prop.
declare function route(routeName: string, params?: any): string;


export default function Index({ stockLedgerEntries: paginatedStockLedgerEntries }: StockLedgerEntriesIndexProps) {
    const columns = useMemo(() => [...baseStockLedgerEntryColumns], []); // Memoize columns if they don't change

    // State for yearly report
    const [yearlyReportData, setYearlyReportData] = useState<YearlyReportData>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null);
    const [loadingReport, setLoadingReport] = useState<boolean>(false);
    const [reportError, setReportError] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const years = useMemo(() => {
        const current = new Date().getFullYear();
        // Generate years from current year down to 2000
        return Array.from({ length: current - 1999 }, (_, i) => current - i);
    }, []);

    const resetExportState = useCallback(() => {
        setSelectedYear(null);
        setExportFormat(null);
        setReportError(null);
        // setPopoverOpen(false); // Keep popover open for user to see error or success, or close based on UX preference
    }, []);

    const fetchYearlyReport = useCallback(async (year: number, format: ExportFormat) => {
        setLoadingReport(true);
        setReportError(null);
        try {
            const response = await axios.get<YearlyReportData>(route('reports.yearly-report'), { params: { year } });
            setYearlyReportData(response.data); // Store data if needed for other purposes

            // After fetching, proceed to export
            if (format === ExportFormat.EXCEL) {
                handleExportYearlyExcel(response.data, year);
            } else if (format === ExportFormat.PDF) {
                handleExportYearlyPdf(response.data, year);
            }
            // Success: close popover and reset
            setPopoverOpen(false);
            resetExportState();

        } catch (err) {
            let message = 'Error generating report.';
            if (axios.isAxiosError(err)) {
                console.error('Axios error fetching yearly report:', err.toJSON ? err.toJSON() : err);
                message += ` Server responded with ${err.response?.status || 'an error'}. Please try again.`;
            } else if (err instanceof Error) {
                console.error('Generic error fetching yearly report:', err);
                message += ` ${err.message}. Please try again.`;
            } else {
                console.error('Unknown error fetching yearly report:', err);
            }
            setReportError(message);
            // Do not close popover on error, so user can see the message
        } finally {
            setLoadingReport(false);
            // Reset exportFormat so useEffect doesn't re-trigger if only year changes next
            // but selectedYear is kept to show which year failed or was selected
            setExportFormat(null);
        }
    }, [resetExportState]); // `route` could be a dependency if it changes, but usually it's stable.

    // Effect to trigger fetch and export after both year and exportFormat are selected
    useEffect(() => {
        if (selectedYear && exportFormat) {
            fetchYearlyReport(selectedYear, exportFormat);
        }
    }, [selectedYear, exportFormat, fetchYearlyReport]);

    const getYearlyReportExportData = (reportData: YearlyReportRow[]): { headers: (string | { content: string; colSpan: number })[][]; body: (string | number)[][] } => {
        if (!reportData.length || !reportData[0]?.months?.length) {
            return { headers: [['No data available']], body: [] };
        }

        const monthNames = reportData[0].months.map((m: MonthlyData) => m.month);
        const headerRow1: (string | { content: string; colSpan: number })[] = ['Médicament'];
        monthNames.forEach(month => {
            headerRow1.push({ content: month, colSpan: 3, styles: { lineWidth: { left: 1, right: 1 }, lineColor: [255, 255, 255] } }); // Spanning 3 columns for each month
        });
        const headerRow2: (string | { content: string; styles: { fillColor: number[] } })[] = ['']; // For medicine name alignment
        monthNames.forEach(() => {
            headerRow2.push(
                { content: 'Entrée', styles: { fillColor: [23, 195, 178], lineWidth: { left: 1 }, lineColor: [255, 255, 255] } },
                { content: 'Sortie', styles: { fillColor: [254, 109, 115] } },
                { content: 'Restant', styles: { fillColor: [34, 124, 157], lineWidth: { right: 1 }, lineColor: [255, 255, 255] } }
            );
        });
        const body = reportData.map((row: YearlyReportRow) => {
            const rowData: (string | number)[] = [row.medicine_name];
            row.months.forEach((m: MonthlyData) => {
                rowData.push(
                    { content: m.received, styles: { fillColor: [195, 224, 192], lineWidth: { left: 1 }, lineColor: [255, 255, 255] } },
                    { content: m.out, styles: { fillColor: [255, 192, 203] } },
                    { content: m.quantity, styles: { fillColor: [204, 229, 220], lineWidth: { right: 1 }, lineColor: [255, 255, 255] } }
                );
            });
            return rowData;
        });

        return { headers: [headerRow1, headerRow2], body };
    };

    const handleExportYearlyExcel = (data: YearlyReportData, year: number) => {
        const { headers, body } = getYearlyReportExportData(data);
        if (headers[0][0] === 'No data available' && body.length === 0) {
            toast.error(`No data available to export for ${year}.`);
            return;
        }
        const wsData = [...headers, ...body];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Merge month headers if data exists and months are present
        if (data.length > 0 && data[0]?.months?.length > 0) {
            ws['!merges'] = ws['!merges'] || [];
            let col = 1; // Start merging from the second column (index 1)
            data[0].months.forEach(() => {
                ws['!merges']?.push({ s: { r: 0, c: col }, e: { r: 0, c: col + 2 } });
                col += 3;
            });
        }

        // Calculate column widths
        const colWidths = wsData[0].map((_, i) => ({
            wch: Math.max(...wsData.map(row => (row[i]?.toString().length || 10)), 10) + 2, // Ensure min width
        }));
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Yearly Report ${year}`);
        XLSX.writeFile(wb, `yearly-report-${year}.xlsx`);
    };

    const handleExportYearlyPdf = (data: YearlyReportData, year: number) => {
        const { headers, body } = getYearlyReportExportData(data);
        if (headers[0][0] === 'No data available' && body.length === 0) {
            toast.error(`No data available to export for ${year}.`);
            return;
        }

        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        autoTable(doc, {
            head: headers,
            body: body,
            styles: { fontSize: 5 }, // Adjusted for potentially more data
            headStyles: { fillColor: [22, 160, 133], fontSize: 5, fontStyle: 'bold', halign: 'center', valign: 'middle', cellPadding: { top: 5, right: 0, bottom: 5, left: 0 } },
            margin: { top: 40, right: 15, bottom: 30, left: 15 }, // Added more margin
            didDrawPage: (hookData) => {
                // Header
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(40);
                doc.text(`Rapport annuel de stock - ${year}`, hookData.settings.margin.left, 30);

                // Footer
                doc.setFontSize(10);
                const pageCount = (doc.internal as any).getNumberOfPages();
                doc.text(`${hookData.pageNumber}/${pageCount}`, hookData.settings.margin.left, doc.internal.pageSize.height - 15);
            },
            columnStyles: { // Example: make first column wider if needed
                0: { cellWidth: 50 },
            },
            // Ensure table fits, otherwise reduce font or adjust column widths
            tableWidth: 'auto', // 'auto', 'wrap' or a number
        });
        doc.save(`yearly-report-${year}.pdf`);
    };

    const handleYearSelect = (year: number) => {
        setSelectedYear(year);
        setReportError(null); // Clear previous errors when a new year is selected
        // No need to setExportFormat here, user will click export type button
    };

    const handleExportButtonClick = (format: ExportFormat) => {
        if (selectedYear) {
            setExportFormat(format); // This will trigger the useEffect
        } else {
            setReportError("Please select a year first.");
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Stock Ledger Entries', href: route('reports.index') }
            ]}
        >
            <Head title="Stock Ledger Entries" />
            <div className="container mx-auto p-4">
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-2xl font-bold">Stock Ledger Entries</h1>
                    <Popover open={popoverOpen} onOpenChange={(isOpen) => {
                        setPopoverOpen(isOpen);
                        if (!isOpen) { // If popover is closed externally, reset state
                            resetExportState();
                        }
                    }}>
                        <PopoverTrigger asChild>
                            <Button variant="default" disabled={loadingReport}>
                                {loadingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate Yearly Report
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-4 space-y-4">
                            {!selectedYear && !loadingReport && (
                                <div>
                                    <div className="mb-2 font-semibold text-center">Select Year</div>
                                    <div className="max-h-60 overflow-y-auto space-y-1">
                                        {years.map(year => (
                                            <Button
                                                variant="ghost"
                                                key={year}
                                                className={`w-full justify-start px-3 py-2 text-sm ${selectedYear === year ? 'bg-accent font-bold' : ''}`}
                                                onClick={() => handleYearSelect(year)}
                                            >
                                                {year}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedYear && !loadingReport && (
                                <div className="space-y-3">
                                    <div className="font-semibold text-center">
                                        Year: {selectedYear}
                                    </div>
                                    <div className="mb-2 font-semibold">Export as:</div>
                                    <div className="flex flex-col space-y-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleExportButtonClick(ExportFormat.EXCEL)}
                                            disabled={loadingReport}
                                        >
                                            {loadingReport && exportFormat === ExportFormat.EXCEL ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Excel
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleExportButtonClick(ExportFormat.PDF)}
                                            disabled={loadingReport}
                                        >
                                            {loadingReport && exportFormat === ExportFormat.PDF ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            PDF
                                        </Button>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedYear(null)} className="w-full mt-2">
                                        Change Year
                                    </Button>
                                </div>
                            )}

                            {loadingReport && (
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="text-sm text-muted-foreground">Generating report for {selectedYear}...</span>
                                    <span className="text-xs text-muted-foreground">Exporting as {exportFormat?.toUpperCase()}</span>
                                </div>
                            )}

                            {reportError && (
                                <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                    {reportError}
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Main DataTable for Stock Ledger Entries */}
                <DataTable
                    columns={columns}
                    paginatedData={paginatedStockLedgerEntries}
                    searchKey="medicine_name"
                    searchPlaceholder="Search stock ledger entries..."
                    inertiaVisitUrl={route('reports.index')}
                    inertiaDataPropName="stockLedgerEntries"
                    initialVisibility={stockLedgerEntryColumnVisibility}
                    pageSizeOptions={[10, 20, 50, 100]}
                    exportFileName={`stock-ledger-entries-${new Date().toISOString().split('T')[0]}`}
                />
            </div>
        </AppLayout>
    );
}