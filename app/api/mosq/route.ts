import { addMosq, getMosqs, getMosqById, updateMosq, deleteMosq } from "@/actions/mosqActions";
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from '@clerk/nextjs/server';

// GET route remains unchanged as it's public
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (id) {
            const response = await getMosqById(id);
            if (!response.success) {
                return NextResponse.json(response, { status: 404 });
            }
            return NextResponse.json(response, { status: 200 });
        } else {
            const by = searchParams.get("by") as "name" | "location" | "coordinates" | "prayerTime" || undefined;
            const query = searchParams.get("query") || "";
            let filterParams: any = { by, query };

            // Handle coordinates for any search type
            const latitude = searchParams.get("lat");
            const longitude = searchParams.get("lng");
            const radius = searchParams.get("radius");

            if (latitude && longitude) {
                filterParams.coordinates = [
                    parseFloat(longitude),
                    parseFloat(latitude)
                ];
                filterParams.radius = radius ? parseInt(radius) : 1000;
            }

            // Handle prayer time specific parameters
            if (by === "prayerTime") {
                const timeStart = searchParams.get("timeStart");
                const timeEnd = searchParams.get("timeEnd");

                const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

                if (timeStart && timeRegex.test(timeStart)) {
                    filterParams.timeRange = {
                        start: timeStart.padStart(5, '0'),
                        end: "23:59"
                    };
                }
                if (timeEnd && timeRegex.test(timeEnd)) {
                    filterParams.timeRange.end = timeEnd.padStart(5, '0');
                }
            }

            const response = await getMosqs(filterParams);
            return NextResponse.json(response, { status: 200 });
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: `Could not fetch mosques: ${error}`,
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { sessionClaims, userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized access"
            }, { status: 401 });
        }

        const userRole = (sessionClaims?.metadata as { role?: string })?.role;
        const userMosqId = (sessionClaims?.metadata as { mosqId?: string })?.mosqId;

        // Only admin and imams without existing mosq can create
        if (userRole !== 'admin' && (userRole !== 'imam' || userMosqId)) {
            return NextResponse.json({
                success: false,
                message: userMosqId ? 
                    "Imam already has an associated mosque" : 
                    "Unauthorized: Only admins and imams can create mosques"
            }, { status: 403 });
        }

        const body = await request.json();
        const response = await addMosq(body);
        return NextResponse.json(response, {
            status: response.success ? 201 : 400
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: `Could not create mosque: ${error}`,
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized access"
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const mosqId = searchParams.get("id");
        console.log(searchParams)

        if (!mosqId) {
            return NextResponse.json({
                success: false,
                message: "Mosque ID is required"
            }, { status: 400 });
        }

        const user = await currentUser();
        const userRole = user?.publicMetadata.role;
        const userMosqId = user?.publicMetadata.mosqId;


        // Allow admin for all mosques, imam only for their mosque
        if (userRole !== 'admin' && (userRole !== 'imam' || userMosqId !== mosqId)) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized: You can only update your assigned mosque"
            }, { status: 403 });
        }

        const body = await request.json();
        const response = await updateMosq(mosqId, body);
        return NextResponse.json(response, {
            status: response.success ? 200 : 404
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: `Could not update mosque: ${error}`,
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { sessionClaims, userId } = await auth();
        
        if (!userId || (sessionClaims?.metadata as { role?: string })?.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: "Unauthorized: Only admins can delete mosques"
            }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({
                success: false,
                message: "Mosque ID is required"
            }, { status: 400 });
        }

        const response = await deleteMosq(id);
        return NextResponse.json(response, {
            status: response.success ? 200 : 404
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: `Could not delete mosque: ${error}`,
        }, { status: 500 });
    }
}