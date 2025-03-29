import dbConnect from "@/lib/db";
import { MosqType, Mosq } from "@/models/mosq";
import { FilterParams } from "@/types";

export async function addMosq(mosq: MosqType) {
    await dbConnect();
    const newMosq = new Mosq(mosq);
    try {
        let saved = await newMosq.save();
        return {
            success: true,
            mosq: saved,
            message: "Mosq saved successfully",
        };
    } catch (error) {
        return { success: false, message: `Could not save mosq: ${error}` };
    }
}

export async function getMosqs(params: FilterParams) {
    await dbConnect();
    console.log("Using existing database connection");

    const filter: any = {};
    
    const skip = (params.page - 1) * 20;

    let geoFilter: any = {};

    // Handle coordinates filter if provided
    if (params.coordinates) {
        const [longitude, latitude] = params.coordinates;
        const radius = params.radius || 1000; // Default 1km radius
        geoFilter = {
            coordinates: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: radius
                }
            }
        };
    }

    // Handle other filters
    switch (params.by) {
        case 'name':
            filter.name = { $regex: params.query, $options: "i" };
            break;
        case 'location':
            filter.location = { $regex: params.query, $options: "i" };
            break;
        case 'prayerTime':
            const prayerName = params.query?.toLowerCase() ?? '';
            
            if (prayerName) {
                // Parse the input time - fix the issue with default time
                const inputTime = params.prayerTime || params.timeRange?.start || '12:00';
                console.log(`Raw input time: ${inputTime}`);
                
                const [inputHours, inputMinutes] = inputTime.split(':').map(Number);
                
                // Calculate the end time (input time + 90 minutes)
                let endHours = inputHours;
                let endMinutes = inputMinutes + 90;
                
                // Adjust if minutes exceed 60
                if (endMinutes >= 60) {
                    endHours += Math.floor(endMinutes / 60);
                    endMinutes = endMinutes % 60;
                }
                
                // Handle day overflow (if hours exceed 24)
                if (endHours >= 24) {
                    endHours = endHours % 24;
                }
                
                console.log(`Filtering for ${prayerName} prayer between ${inputHours}:${inputMinutes} and ${endHours}:${endMinutes}`);
                
                // The key issue is here - we need to properly reference the nested fields
                filter[`prayerTimes.${prayerName}`] = { $exists: true };
                
                filter.$or = [
                    // Case 1: Start hour with minutes >= inputMinutes
                    {
                        $and: [
                            { [`prayerTimes.${prayerName}.hours`]: inputHours },
                            { [`prayerTimes.${prayerName}.minutes`]: { $gte: inputMinutes } }
                        ]
                    },
                    // Case 2: Hours between start and end (any minutes)
                    {
                        [`prayerTimes.${prayerName}.hours`]: { 
                            $gt: inputHours, 
                            $lt: endHours 
                        }
                    },
                    // Case 3: End hour with minutes <= endMinutes
                    {
                        $and: [
                            { [`prayerTimes.${prayerName}.hours`]: endHours },
                            { [`prayerTimes.${prayerName}.minutes`]: { $lte: endMinutes } }
                        ]
                    }
                ];
                
                // Debug the filter
                console.log("Prayer time filter:", JSON.stringify(filter, null, 2));
            }
            break;
    }

    try {
        // Combine filters if both exist
        const finalFilter = params.coordinates
            ? { $and: [filter, geoFilter] }
            : filter;

        const mosques = await Mosq.find(finalFilter).limit(20).skip(skip).limit(Number(20)).lean();
        return { success: true, mosques };
    } catch (error) {
        return { success: false, message: `Could not fetch mosques: ${error}` };
    }
}

export async function getMosqById(id: string) {
    await dbConnect();
    try {
        const mosq = await Mosq.findById(id);
        return { success: true, mosq };
    } catch (error) {
        return { success: false, message: `Could not fetch mosq: ${error}` };
    }
}

export async function updateMosq(id: string, mosq: MosqType) {
    await dbConnect();
    try {
        const updatedmosq = await Mosq.findByIdAndUpdate(id, mosq, { new: true, runValidators: true });
        if (!updatedmosq) {
            return { success: false, message: "Mosq not found" };
        }
        return { success: true, mosq: updatedmosq };
    } catch (error) {
        return { success: false, message: `Could not update mosq: ${error}` };
    }
}

export async function deleteMosq(id: string) {
    await dbConnect();
    try {
        const mosq = await Mosq.findByIdAndDelete(id);
        if (!mosq) {
            return { success: false, message: "Mosq not found" };
        }
        return { success: true, message: "Mosq deleted successfully" };
    } catch (error) {
        return { success: false, message: `Could not delete Mosq: ${error}` };
    }
}
