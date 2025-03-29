import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

type ConnectionObject = {
    isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Using existing database connection");
        return;
    }
    try {
        const db = await mongoose.connect(MONGODB_URI, {});
        connection.isConnected = db.connections[0].readyState;
        console.log("New database connection");
    } catch (error) {
        console.error("Error connecting to database:", error);
        process.exit(1);
    }
}

export default dbConnect;
