"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import { useRouter } from "next-nprogress-bar";

interface ListingsFiltersProps {
    currentStatus: string;
    currentSearch: string;
}

export function ListingsFilters({
    currentStatus,
    currentSearch,
}: ListingsFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchInput, setSearchInput] = useState(currentSearch);

    const statusOptions = [
        { value: "all", label: "All Listings", count: null },
        { value: "pending", label: "Pending", count: null },
        { value: "approved", label: "Approved", count: null },
        { value: "rejected", label: "Rejected", count: null },
    ];

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams);

        if (status === "all") {
            params.delete("status");
        } else {
            params.set("status", status);
        }

        params.delete("page");

        const queryString = params.toString();
        router.push(`/dashboard${queryString ? `?${queryString}` : ""}`);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);

        if (searchInput.trim()) {
            params.set("search", searchInput.trim());
        } else {
            params.delete("search");
        }

        params.delete("page");

        const queryString = params.toString();
        router.push(`/dashboard${queryString ? `?${queryString}` : ""}`);
    };

    const clearSearch = () => {
        setSearchInput("");
        const params = new URLSearchParams(searchParams);
        params.delete("search");
        params.delete("page");

        const queryString = params.toString();
        router.push(`/dashboard${queryString ? `?${queryString}` : ""}`);
    };

    const clearAllFilters = () => {
        setSearchInput("");
        router.push("/dashboard");
    };

    const hasActiveFilters = currentStatus !== "all" || currentSearch;

    return (
        <div className="bg-white rounded-lg border p-4 space-y-4">
            {/* Status Filter */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Status
                </label>
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                        <Button
                            key={option.value}
                            variant={
                                currentStatus === option.value
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() => handleStatusChange(option.value)}
                            className="flex items-center gap-1"
                        >
                            {option.label}
                            {option.count && (
                                <Badge variant="secondary" className="ml-1">
                                    {option.count}
                                </Badge>
                            )}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Search Filter */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Listings
                </label>
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search by make, model, location, or owner..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Button type="submit" size="sm">
                        Search
                    </Button>
                </form>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Filter className="h-4 w-4" />
                        <span>Active filters:</span>
                        {currentStatus !== "all" && (
                            <Badge variant="secondary">
                                Status: {currentStatus}
                            </Badge>
                        )}
                        {currentSearch && (
                            <Badge variant="secondary">
                                Search: &quot;{currentSearch}&quot;
                            </Badge>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Clear all
                    </Button>
                </div>
            )}
        </div>
    );
}
