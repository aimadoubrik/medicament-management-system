import { createDateColumn, createNumberColumn, createTextColumn } from '@/components/data-table/column-def';
import { StockLedgerEntry } from '@/types';
import { ColumnDef } from '@tanstack/react-table';

export const stockLedgerEntryColumns: ColumnDef<StockLedgerEntry>[] = [
    createTextColumn<StockLedgerEntry>('transaction_type', 'Transaction Type'),
    createTextColumn<StockLedgerEntry>('batch_number', 'Batch Number'),
    createTextColumn<StockLedgerEntry>('medicine_name', 'Medicine'),
    createTextColumn<StockLedgerEntry>('user_name', 'User'),
    createNumberColumn<StockLedgerEntry>('quantity_change', 'Quantity'),
    createNumberColumn<StockLedgerEntry>('quantity_after_transaction', 'Quantity After Transaction'),
    createDateColumn<StockLedgerEntry>('transaction_date', 'Transaction Date'),
    createTextColumn<StockLedgerEntry>('notes', 'Notes'),

];

// Default visibility for responsive design
export const stockLedgerEntryColumnVisibility = {
    transaction_type: true,
    batch_number: true,
    medicine_name: true,
    user_name: true,
    quantity_change: true,
    quantity_after_transaction: true,
    transaction_date: true,
    notes: true,

};
