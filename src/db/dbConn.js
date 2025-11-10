import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log(`Connected to mongoDB successfully!`);
    } catch (err) {
        console.log(err);
    }
};

export default connectDB;