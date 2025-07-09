// seed/index.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { seedBrands } from "./brand.seeder.js";
import { seedDeviceModels } from "./device-model.seeder.js";
import { seedDamageTypes } from "./damage-type.seeder.js";
import { seedSpareparts } from "./sparepart.seeder.js";
import { seedUsers } from "./user.seeder.js";
import { seedCustomers } from "./customer.seeder.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/sashi";

const runSeeder = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    await seedBrands();
    await seedDeviceModels();
    await seedDamageTypes();
    await seedSpareparts();
    await seedUsers();
    await seedCustomers();

    console.log("🎉 All seeders executed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runSeeder();
