import mongoose from 'mongoose';

const connDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected at ${conn.connection.host}`);
    } catch (error) {
        console.log("Error connecting to mongoDB", error);
    }
}


export default connDB;