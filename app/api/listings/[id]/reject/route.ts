import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Get current listing data for audit trail
    const { data: currentListing, error: fetchError } = await supabase
      .from("car_listings")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Update listing status to rejected
    const { data: updatedListing, error: updateError } = await supabase
      .from("car_listings")
      .update({ status: "rejected" })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error rejecting listing:", updateError);
      return NextResponse.json(
        { error: "Failed to reject listing" },
        { status: 500 }
      );
    }

    // Log the rejection action
    const { error: auditError } = await supabase
      .from("listing_audit_trail")
      .insert({
        listing_id: id,
        admin_id: user.id,
        action: "rejected",
        previous_data: currentListing,
        new_data: updatedListing,
      });

    if (auditError) {
      console.error("Error logging audit trail:", auditError);
    }

    return NextResponse.json({
      message: "Listing rejected successfully",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
