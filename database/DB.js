import mongoose from "mongoose";

export default async function connectDB() {
    try {
        await mongoose.connect(process.env.DBNAME);
        console.log("DB connected!");
        
    }catch(err) {
        console.log("not connected! : " + err);
    }
}