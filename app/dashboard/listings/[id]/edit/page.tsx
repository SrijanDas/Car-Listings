import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EditListingForm } from "@/components/dashboard/edit-listing-form";

interface EditListingPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditListingPage({
    params,
}: EditListingPageProps) {
    const supabase = await createClient();
    const { id } = await params;

    const { data: listing, error } = await supabase
        .from("car_listings")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

    if (error || !listing) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit Listing
                    </h1>
                    <p className="text-gray-600">
                        {listing.year} {listing.make} {listing.model}
                    </p>
                </div>
            </div>

            <EditListingForm listing={listing} />
        </div>
    );
}
