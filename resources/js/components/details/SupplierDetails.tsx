import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Supplier } from '@/types';
import { format } from 'date-fns';
import { AtSign, Calendar, MapPin, Phone, User, Users } from 'lucide-react';

interface SupplierDetailsProps {
    supplier: Supplier;
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

export function SupplierDetails({ supplier }: SupplierDetailsProps) {
    return (
        <Card className="overflow-hidden border-none bg-transparent shadow-none">
            <CardHeader className="bg-accent/50 rounded p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-primary flex items-center gap-2 text-xl font-bold">
                            <Users className="h-5 w-5" />
                            {supplier.name}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm font-medium"></CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Primary Details Section */}
                <div className="grid grid-cols-1 gap-x-8 gap-y-4">
                    <DetailItem
                        icon={<User className="text-muted-foreground h-4 w-4" />}
                        label="Contact Person"
                        value={supplier.contact_person ?? 'N/A'}
                    />

                    <DetailItem icon={<Phone className="text-muted-foreground h-4 w-4" />} label="Phone" value={supplier.phone ?? 'N/A'} />

                    <DetailItem icon={<AtSign className="text-muted-foreground h-4 w-4" />} label="Email" value={supplier.email ?? 'N/A'} />

                    <DetailItem icon={<MapPin className="text-muted-foreground h-4 w-4" />} label="Address" value={supplier.address ?? 'N/A'} />

                    <DetailItem
                        icon={<Calendar className="text-muted-foreground h-4 w-4" />}
                        label="Created"
                        value={formatDate(supplier.created_at)}
                    />

                    <DetailItem
                        icon={<Calendar className="text-muted-foreground h-4 w-4" />}
                        label="Updated"
                        value={formatDate(supplier.updated_at)}
                    />
                </div>
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
