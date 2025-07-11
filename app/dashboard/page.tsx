import { createClient } from "@/lib/supabase/server";
import { ListingsTable } from "@/components/dashboard/listings-table";
import { ListingsFilters } from "@/components/dashboard/listings-filters";
import { Suspense } from "react";

interface SearchParams {
    page?: string;
    status?: string;
    search?: string;
}

interface DashboardPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function DashboardPage({
    searchParams,
}: DashboardPageProps) {
    const supabase = await createClient();
    const params = await searchParams;

    const page = parseInt(params.page || "1");
    const limit = 10;
    const status = params.status || "all";
    const search = params.search || "";

    const offset = (page - 1) * limit;

    let query = supabase
        .from("car_listings")
        .select("*", { count: "exact" })
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    if (status !== "all") {
        query = query.eq("status", status);
    }

    if (search) {
        query = query.or(
            `make.ilike.%${search}%,model.ilike.%${search}%,location.ilike.%${search}%,owner_name.ilike.%${search}%`
        );
    }

    query = query.range(offset, offset + limit - 1);

    const { data: listings, error, count } = await query;

    if (error) {
        console.error("Error fetching listings:", error);
        return (
            <div className="text-center py-12">
                <p className="text-red-600">
                    Error loading listings. Please try again.
                </p>
            </div>
        );
    }

    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const pagination = {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPreviousPage,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Car Listings
                    </h1>
                    <p className="text-gray-600">
                        Manage and review car rental listings
                    </p>
                </div>
                <div className="text-sm text-gray-500">
                    Total: {count || 0} listings
                </div>
            </div>

            {/* Filters */}
            <ListingsFilters currentStatus={status} currentSearch={search} />

            {/* Loading Suspense */}
            <Suspense
                fallback={
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">
                            Loading listings...
                        </p>
                    </div>
                }
            >
                {/* Listings Table */}
                <ListingsTable
                    listings={listings || []}
                    pagination={pagination}
                />
            </Suspense>
        </div>
    );
}
