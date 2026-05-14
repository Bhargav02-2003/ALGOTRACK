import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const docs = await db.collection('userprogresses').find({}).toArray();
  console.log("Docs:", docs);
  process.exit(0);
}
run();
