import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/database.types";

type CarListing = Database["public"]["Tables"]["car_listings"]["Row"];
type AuditAction = Database["public"]["Enums"]["audit_action"];
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// Helper function to log audit trail
async function logAuditTrail(
  supabase: SupabaseClient,
  listingId: string,
  adminId: string,
  action: AuditAction,
  previousData?: CarListing,
  newData?: CarListing
) {
  const { error } = await supabase.from("listing_audit_trail").insert({
    listing_id: listingId,
    admin_id: adminId,
    action,
    previous_data: previousData,
    new_data: newData,
  });

  if (error) {
    console.error("Error logging audit trail:", error);
  }
}

export async function GET(
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

    const { data: listing, error } = await supabase
      .from("car_listings")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      console.error("Error fetching listing:", error);
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Log the view action
    await logAuditTrail(supabase, id, user.id, "viewed");

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();

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

    // Update the listing
    const { data: updatedListing, error: updateError } = await supabase
      .from("car_listings")
      .update({
        make: body.make,
        model: body.model,
        year: body.year,
        price: body.price,
        location: body.location,
        description: body.description,
        image_urls: body.image_urls,
        owner_name: body.owner_name,
        owner_email: body.owner_email,
        owner_phone: body.owner_phone,
        mileage: body.mileage,
        fuel_type: body.fuel_type,
        transmission: body.transmission,
        features: body.features,
        status: body.status,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating listing:", updateError);
      return NextResponse.json(
        { error: "Failed to update listing" },
        { status: 500 }
      );
    }

    // Log the edit action
    await logAuditTrail(
      supabase,
      id,
      user.id,
      "edited",
      currentListing,
      updatedListing
    );

    return NextResponse.json({ listing: updatedListing });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
