import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Car,
    Calendar,
    Phone,
    Mail,
    User,
    ArrowLeft,
    Edit,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ListingPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
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

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            approved: "bg-green-100 text-green-800 border-green-200",
            rejected: "bg-red-100 text-red-800 border-red-200",
        };

        return (
            <Badge
                className={
                    variants[status as keyof typeof variants] ||
                    variants.pending
                }
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Listings
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {listing.year} {listing.make} {listing.model}
                        </h1>
                        <p className="text-gray-600">Listing Details</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(listing.status)}
                    <Link href={`/dashboard/listings/${listing.id}/edit`}>
                        <Button size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Listing
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Images */}
                    {listing.image_urls && listing.image_urls.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Photos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {listing.image_urls.map(
                                        (url: string, index: number) => (
                                            <div
                                                key={index}
                                                className="relative aspect-video rounded-lg overflow-hidden"
                                            >
                                                <Image
                                                    src={url}
                                                    alt={`${listing.make} ${
                                                        listing.model
                                                    } - Photo ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {listing.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Features */}
                    {listing.features && listing.features.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Features</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {listing.features.map(
                                        (feature: string, index: number) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                            >
                                                {feature}
                                            </Badge>
                                        )
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Car Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Vehicle Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Make
                                    </p>
                                    <p className="font-medium">
                                        {listing.make}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Model
                                    </p>
                                    <p className="font-medium">
                                        {listing.model}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Year
                                    </p>
                                    <p className="font-medium">
                                        {listing.year}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Price
                                    </p>
                                    <p className="font-medium text-green-600">
                                        {formatPrice(listing.price)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Mileage
                                    </p>
                                    <p className="font-medium">
                                        {listing.mileage?.toLocaleString()}{" "}
                                        miles
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Fuel Type
                                    </p>
                                    <p className="font-medium capitalize">
                                        {listing.fuel_type}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Transmission
                                    </p>
                                    <p className="font-medium capitalize">
                                        {listing.transmission}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Location
                                    </p>
                                    <p className="font-medium">
                                        {listing.location}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Owner Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Owner Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">
                                    {listing.owner_name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <a
                                    href={`mailto:${listing.owner_email}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {listing.owner_email}
                                </a>
                            </div>
                            {listing.owner_phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <a
                                        href={`tel:${listing.owner_phone}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {listing.owner_phone}
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Listing Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Created</p>
                                <p className="font-medium">
                                    {formatDate(listing.created_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Last Updated
                                </p>
                                <p className="font-medium">
                                    {formatDate(listing.updated_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <div className="mt-1">
                                    {getStatusBadge(listing.status)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
