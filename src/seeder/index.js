// seed.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import userSeeder from "./user.seeder.js";
dotenv.config();

export const main = async () => {
  try {
    // Koneksi ke database
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/service_center"
    );
    console.log("Connected to MongoDB");

    // Jalankan seeder setelah koneksi berhasil
    await userSeeder();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    // Tutup koneksi setelah operasi selesai
    mongoose.connection.close();
  }
};

main().catch((err) => console.error("Error in main function:", err));
