// seed/user.seeder.js
import bcrypt from "bcryptjs";
import User from "../model/user.model.js";

export const seedUsers = async () => {
  const users = [
    {
      name: "Admin Utama",
      username: "admin",
      password: await bcrypt.hash("password", 10),
      role: "admin",
    },
    {
      name: "Teknisi Kevin",
      username: "kevin",
      password: await bcrypt.hash("password", 10),
      role: "teknisi",
    },
    {
      name: "Sparepart Sashi",
      username: "sashi",
      password: await bcrypt.hash("password", 10),
      role: "sparepart",
    },
  ];

  await User.deleteMany();
  await User.insertMany(users);
  console.log("✅ Seeded Users");
};
