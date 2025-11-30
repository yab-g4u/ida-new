import { MapPin } from 'lucide-react';

export default function LocatePharmacyPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MapPin className="w-24 h-24 text-muted-foreground mb-4" />
            <h1 className="font-headline text-3xl text-primary-foreground">Locate Pharmacy</h1>
            <p className="mt-2 text-muted-foreground">
                GPS integration for finding nearby pharmacies is coming soon!
            </p>
        </div>
    );
}
