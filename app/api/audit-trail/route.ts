import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const listingId = searchParams.get("listing_id");
    const action = searchParams.get("action");

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
      return NextResponse.json(
        { error: "Failed to fetch audit trail" },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      auditTrail,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
