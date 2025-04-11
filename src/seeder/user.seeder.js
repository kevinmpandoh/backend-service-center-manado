// seeders/userSeeder.ts
import User from "../model/user.model.js";
import bcrypt from "bcryptjs";

const userSeeder = async () => {
  try {
    const deleteResult = await User.deleteMany();
    console.log(`Deleted ${deleteResult.deletedCount} user(s)`);

    // Data user baru untuk diinsert
    const users = [
      {
        name: "Admin",
        username: "admin",
        password: await bcrypt.hash("password", 10),
        role: "admin",
      },
    ];

    // Menambahkan data user baru ke database
    await User.insertMany(users);
    console.log("User seeder completed successfully");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

export default userSeeder;
