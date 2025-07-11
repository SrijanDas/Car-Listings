"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Check,
  X,
  Edit,
  ChevronLeft,
  ChevronRight,
  History,
  User,
  Calendar,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { Database } from "@/database.types";

type AuditAction = Database["public"]["Enums"]["audit_action"];
type CarListing = Database["public"]["Tables"]["car_listings"]["Row"];

interface AuditTrailEntry {
  id: string;
  listing_id: string;
  admin_id: string;
  action: AuditAction;
  previous_data: CarListing | null;
  new_data: CarListing | null;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface AuditTrailTableProps {
  auditTrail: AuditTrailEntry[];
  pagination: Pagination;
  currentAction: string;
  currentListingId: string;
}

export function AuditTrailTable({
  auditTrail,
  pagination,
  currentAction,
  currentListingId,
}: AuditTrailTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listingIdFilter, setListingIdFilter] = useState(currentListingId);

  const getActionBadge = (action: string) => {
    const variants = {
      viewed: "bg-blue-100 text-blue-800 border-blue-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      edited: "bg-purple-100 text-purple-800 border-purple-200",
    };

    const icons = {
      viewed: Eye,
      approved: Check,
      rejected: X,
      edited: Edit,
    };

    const Icon = icons[action as keyof typeof icons];

    return (
      <Badge
        className={`${
          variants[action as keyof typeof variants] || variants.viewed
        } flex items-center gap-1`}
      >
        <Icon className="h-3 w-3" />
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleActionFilter = (action: string) => {
    const params = new URLSearchParams(searchParams);

    if (action === "all") {
      params.delete("action");
    } else {
      params.set("action", action);
    }

    params.delete("page");

    const queryString = params.toString();
    router.push(
      `/dashboard/audit-trail${queryString ? `?${queryString}` : ""}`
    );
  };

  const handleListingIdFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);

    if (listingIdFilter.trim()) {
      params.set("listing_id", listingIdFilter.trim());
    } else {
      params.delete("listing_id");
    }

    params.delete("page");

    const queryString = params.toString();
    router.push(
      `/dashboard/audit-trail${queryString ? `?${queryString}` : ""}`
    );
  };

  const clearFilters = () => {
    setListingIdFilter("");
    router.push("/dashboard/audit-trail");
  };

  const actionOptions = [
    { value: "all", label: "All Actions" },
    { value: "viewed", label: "Viewed" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "edited", label: "Edited" },
  ];

  const hasActiveFilters = currentAction || currentListingId;

  if (auditTrail.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No audit trail found
            </h3>
            <p className="text-gray-500">
              No admin actions match your current filters.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Action
            </label>
            <div className="flex flex-wrap gap-2">
              {actionOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={
                    currentAction === option.value ||
                    (currentAction === "" && option.value === "all")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleActionFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Listing ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Listing ID
            </label>
            <form onSubmit={handleListingIdFilter} className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter listing ID..."
                value={listingIdFilter}
                onChange={(e) => setListingIdFilter(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Filter
              </Button>
            </form>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Trail Entries */}
      <div className="space-y-3">
        {auditTrail.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getActionBadge(entry.action)}
                    <span className="text-sm text-gray-500">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Admin ID:</span>
                      <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                        {entry.admin_id.slice(0, 8)}...
                      </code>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Listing:</span>
                      <Link
                        href={`/dashboard/listings/${entry.listing_id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        View Listing
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Listing ID:</span>
                      <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                        {entry.listing_id.slice(0, 8)}...
                      </code>
                    </div>
                  </div>

                  {/* Show changes for edit actions */}
                  {entry.action === "edited" &&
                    entry.previous_data &&
                    entry.new_data && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <p className="font-medium mb-1">Changes made:</p>
                        <div className="space-y-1">
                          {Object.keys(entry.new_data).map((key) => {
                            const oldValue = (
                              entry.previous_data as Record<string, unknown>
                            )?.[key];
                            const newValue = (
                              entry.new_data as Record<string, unknown>
                            )?.[key];

                            if (oldValue !== newValue) {
                              return (
                                <div
                                  key={key}
                                  className="flex items-center gap-2 text-xs"
                                >
                                  <span className="font-medium capitalize">
                                    {key.replace("_", " ")}:
                                  </span>
                                  <span className="text-red-600 line-through">
                                    {String(oldValue)}
                                  </span>
                                  <span>→</span>
                                  <span className="text-green-600">
                                    {String(newValue)}
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
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
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/audit-trail?page=${pagination.page - 1}${
                    currentAction ? `&action=${currentAction}` : ""
                  }${
                    currentListingId ? `&listing_id=${currentListingId}` : ""
                  }`}
                  className={
                    !pagination.hasPreviousPage ? "pointer-events-none" : ""
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
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Link
                  href={`/dashboard/audit-trail?page=${pagination.page + 1}${
                    currentAction ? `&action=${currentAction}` : ""
                  }${
                    currentListingId ? `&listing_id=${currentListingId}` : ""
                  }`}
                  className={
                    !pagination.hasNextPage ? "pointer-events-none" : ""
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
