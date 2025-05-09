import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Medicine } from '@/types';
import { format } from 'date-fns';
import { AlertTriangle, Calendar, Factory, Info, Package, Pill } from 'lucide-react';

interface MedicineDetailsProps {
    medicine: Medicine;
}

// Helper to format date strings or return N/A
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'PPP'); // e.g., Jun 21st, 2024
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString; // Fallback to original string if format fails
    }
};

export function MedicineDetails({ medicine }: MedicineDetailsProps) {
    return (
        <Card className="overflow-hidden border-none bg-transparent shadow-none">
            <CardHeader className="bg-accent/50 rounded p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-primary flex items-center gap-2 text-xl font-bold">
                            <Pill className="h-5 w-5" />
                            {medicine.name}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm font-medium">
                            {medicine.dosage && <span className="text-primary/80">{medicine.dosage}</span>}
                            {medicine.dosage && ' • '}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Primary Details Section */}
                <div className="grid grid-cols-1 gap-x-8 gap-y-4">
                    <DetailItem icon={<Package className="text-muted-foreground h-4 w-4" />} label="Form" value={medicine.form ?? 'N/A'} />

                    <DetailItem
                        icon={<Factory className="text-muted-foreground h-4 w-4" />}
                        label="Manufacturer/Distributor"
                        value={medicine.manufacturer_distributor ?? 'N/A'}
                    />

                    <DetailItem
                        icon={<AlertTriangle className="text-muted-foreground h-4 w-4" />}
                        label="Low Stock Threshold"
                        value={medicine.reorder_level ?? 'N/A'}
                    />

                    <DetailItem
                        icon={<Calendar className="text-muted-foreground h-4 w-4" />}
                        label="Created"
                        value={formatDate(medicine.created_at)}
                    />

                    <DetailItem
                        icon={<Calendar className="text-muted-foreground h-4 w-4" />}
                        label="Updated"
                        value={formatDate(medicine.updated_at)}
                    />
                </div>

                {/* Description (if present) */}
                {medicine.description && (
                    <div className="pt-1">
                        <h4 className="text-foreground mb-2 flex items-center font-medium">
                            <Info className="text-primary mr-2 h-4 w-4" />
                            Description
                        </h4>
                        <div className="bg-accent/50 text-foreground border-primary rounded-md border-l-4 p-4 text-sm whitespace-pre-wrap">
                            {medicine.description}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Helper component for detail items
const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-center">
        <div className="mr-2">{icon}</div>
        <div className="text-muted-foreground mr-2">{label}:</div>
        <div className="text-foreground font-medium">{value}</div>
    </div>
);
