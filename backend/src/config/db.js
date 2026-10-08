import mongoose from 'mongoose';
export const connectDB = async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
};
