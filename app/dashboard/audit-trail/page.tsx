import { createClient } from "@/lib/supabase/server";
import { AuditTrailTable } from "@/components/dashboard/audit-trail-table";
import { Suspense } from "react";

interface SearchParams {
  page?: string;
  action?: string;
  listing_id?: string;
}

interface AuditTrailPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AuditTrailPage({
  searchParams,
}: AuditTrailPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  // Get query parameters
  const page = parseInt(params.page || "1");
  const limit = 20;
  const action = params.action || "";
  const listingId = params.listing_id || "";

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Build query to get audit trail data
  let query = supabase
    .from("listing_audit_trail")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply filters
  if (listingId) {
    query = query.eq("listing_id", listingId);
  }

  if (action) {
    query = query.eq("action", action);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: auditTrail, error, count } = await query;

  if (error) {
    console.error("Error fetching audit trail:", error);
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Error loading audit trail. Please try again.
        </p>
      </div>
    );
  }

  // Calculate pagination info
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
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
          <p className="text-gray-600">
            Track all admin actions on car listings
          </p>
        </div>
        <div className="text-sm text-gray-500">Total: {count || 0} actions</div>
      </div>

      {/* Loading Suspense */}
      <Suspense
        fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading audit trail...</p>
          </div>
        }
      >
        {/* Audit Trail Table */}
        <AuditTrailTable
          auditTrail={auditTrail || []}
          pagination={pagination}
          currentAction={action}
          currentListingId={listingId}
        />
      </Suspense>
    </div>
  );
}
