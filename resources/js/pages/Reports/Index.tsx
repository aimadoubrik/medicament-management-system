import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";

export default function ReportsIndex({summary}) {

    console.log(summary);

    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: route('reports.index') }]}>
            <Head title="Reports" />
        </AppLayout>
    );
}