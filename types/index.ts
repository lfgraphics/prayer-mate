export interface FilterParams {
    by?: "name" | "location" | "coordinates" | "prayerTime";
    query?: string;
    timeRange?: {
        start: string;
        end: string;
    };
    prayerTime?: string;
    coordinates?: [number, number]; // [longitude, latitude]
    radius?: number; // in meters
    page: number;
}
