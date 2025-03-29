import mongoose, { Schema, model, models } from "mongoose";

// Define reusable time structures
interface Time {
    hours: number;
    minutes: number;
}

interface OptionalTime {
    hours?: number;
    minutes?: number;
}

// Define the MosqType interface
export interface MosqType {
    _id?: mongoose.Types.ObjectId;
    id?: string;
    name: string;
    coordinates: {
        type: "Point";
        coordinates: [number, number];
    };
    location: string;
    imam: string;
    prayerTimes: {
        fajr: Time;
        zohar: Time;
        asr: Time;
        maghrib: Time;
        isha: Time;
        juma?: OptionalTime;
        eidulfitr?: OptionalTime;
        eidulazha?: OptionalTime;
    };
    photos: string[];
    verified: boolean;
}

// Define reusable schemas
const timeSchema = {
    hours: { type: Number, min: 0, max: 23, required: true },
    minutes: { type: Number, min: 0, max: 59, required: true }
};

const optionalTimeSchema = {
    hours: { type: Number, min: 0, max: 23 },
    minutes: { type: Number, min: 0, max: 59 }
};

// Define the full schema
const MosqSchema = new Schema<MosqType>(
    {
        name: { type: String, required: true },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true,
                validate: {
                    validator: (v: number[]) =>
                        v.length === 2 &&
                        v[0] >= -180 && v[0] <= 180 &&
                        v[1] >= -90 && v[1] <= 90,
                    message: 'Invalid coordinates'
                }
            }
        },
        location: { type: String, required: true },
        imam: { type: String, required: true },
        prayerTimes: {
            fajr: timeSchema,
            zohar: timeSchema,
            asr: timeSchema,
            maghrib: timeSchema,
            isha: timeSchema,
            juma: optionalTimeSchema,
            eidulfitr: optionalTimeSchema,
            eidulazha: optionalTimeSchema
        },
        photos: { type: [String], default: [] },
        verified: { type: Boolean, required: true, default: false }
    },
    {
        timestamps: true
    }
);

// Add geospatial index
MosqSchema.index({ coordinates: "2dsphere" });

// Export the model
export const Mosq = models.Mosq || model<MosqType>("Mosq", MosqSchema);