"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Eye,
    Check,
    X,
    Edit,
    ChevronLeft,
    ChevronRight,
    Car,
    MapPin,
    DollarSign,
    Fuel,
    Settings,
} from "lucide-react";
import { useFeedback } from "@/contexts/feedback-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Database } from "@/database.types";

type CarListing = Database["public"]["Tables"]["car_listings"]["Row"];

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

interface ListingsTableProps {
    listings: CarListing[];
    pagination: Pagination;
}

export function ListingsTable({ listings, pagination }: ListingsTableProps) {
    const { addMessage } = useFeedback();
    const router = useRouter();
    const [loadingActions, setLoadingActions] = useState<
        Record<string, boolean>
    >({});

    const getStatusBadge = (status: string | null) => {
        const statusValue = status || "pending";
        const variants = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            approved: "bg-green-100 text-green-800 border-green-200",
            rejected: "bg-red-100 text-red-800 border-red-200",
        };

        return (
            <Badge
                className={
                    variants[statusValue as keyof typeof variants] ||
                    variants.pending
                }
            >
                {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
            </Badge>
        );
    };

    const handleAction = async (
        listingId: string,
        action: "approve" | "reject"
    ) => {
        setLoadingActions((prev) => ({ ...prev, [listingId]: true }));

        try {
            const response = await fetch(
                `/api/listings/${listingId}/${action}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to ${action} listing`);
            }

            const data = await response.json();
            addMessage("success", data.message);

            // Refresh the page to show updated data
            router.refresh();
        } catch (error) {
            console.error(`Error ${action}ing listing:`, error);
            addMessage(
                "error",
                `Failed to ${action} listing. Please try again.`
            );
        } finally {
            setLoadingActions((prev) => ({ ...prev, [listingId]: false }));
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (listings.length === 0) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="text-center">
                        <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No listings found
                        </h3>
                        <p className="text-gray-500">
                            No car listings match your current filters.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Listings Cards */}
            <div className="grid gap-4">
                {listings.map((listing) => (
                    <Card key={listing.id} className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Car className="h-5 w-5 text-blue-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {listing.year} {listing.make}{" "}
                                                {listing.model}
                                            </h3>
                                        </div>
                                        {getStatusBadge(listing.status)}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <DollarSign className="h-4 w-4" />
                                            <span className="font-medium">
                                                {formatPrice(listing.price)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span>{listing.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Fuel className="h-4 w-4" />
                                            <span className="capitalize">
                                                {listing.fuel_type || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Settings className="h-4 w-4" />
                                            <span className="capitalize">
                                                {listing.transmission || "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <span>Owner: {listing.owner_name}</span>
                                        <span>•</span>
                                        <span>
                                            Listed:{" "}
                                            {formatDate(listing.created_at)}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {listing.mileage?.toLocaleString()}{" "}
                                            miles
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm line-clamp-2">
                                        {listing.description}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 ml-4">
                                    <Link
                                        href={`/dashboard/listings/${listing.id}`}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-1"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                    </Link>

                                    <Link
                                        href={`/dashboard/listings/${listing.id}/edit`}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-1"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit
                                        </Button>
                                    </Link>

                                    {listing.status === "pending" && (
                                        <>
                                            <Button
                                                size="sm"
                                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                                                onClick={() =>
                                                    handleAction(
                                                        listing.id,
                                                        "approve"
                                                    )
                                                }
                                                disabled={
                                                    loadingActions[listing.id]
                                                }
                                            >
                                                <Check className="h-4 w-4" />
                                                {loadingActions[listing.id]
                                                    ? "Approving..."
                                                    : "Approve"}
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="flex items-center gap-1"
                                                onClick={() =>
                                                    handleAction(
                                                        listing.id,
                                                        "reject"
                                                    )
                                                }
                                                disabled={
                                                    loadingActions[listing.id]
                                                }
                                            >
                                                <X className="h-4 w-4" />
                                                {loadingActions[listing.id]
                                                    ? "Rejecting..."
                                                    : "Reject"}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing{" "}
                                {(pagination.page - 1) * pagination.limit + 1}{" "}
                                to{" "}
                                {Math.min(
                                    pagination.page * pagination.limit,
                                    pagination.total
                                )}{" "}
                                of {pagination.total} results
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/dashboard?page=${
                                        pagination.page - 1
                                    }`}
                                    className={
                                        !pagination.hasPreviousPage
                                            ? "pointer-events-none"
                                            : ""
                                    }
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pagination.hasPreviousPage}
                                        className="flex items-center gap-1"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                </Link>

                                <span className="text-sm text-gray-600">
                                    Page {pagination.page} of{" "}
                                    {pagination.totalPages}
                                </span>

                                <Link
                                    href={`/dashboard?page=${
                                        pagination.page + 1
                                    }`}
                                    className={
                                        !pagination.hasNextPage
                                            ? "pointer-events-none"
                                            : ""
                                    }
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pagination.hasNextPage}
                                        className="flex items-center gap-1"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
