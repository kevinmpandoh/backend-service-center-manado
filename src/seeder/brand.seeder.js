// seeders/userSeeder.ts
import Brand from "../model/brand.model.js";

export const seedBrands = async () => {
  try {
    const deleteResult = await Brand.deleteMany();
    console.log(`Deleted ${deleteResult.deletedCount} brand(s)`);

    // Data user baru untuk diinsert
    const brands = [
      { name: "Asus", type: "Laptop" },
      { name: "Acer", type: "Laptop" },
      { name: "Samsung", type: "HP" },
      { name: "Xiaomi", type: "HP" },
      { name: "Lenovo", type: "Laptop" },
    ];

    // Menambahkan data user baru ke database
    await Brand.insertMany(brands);
    console.log("Brand seeder completed successfully");
  } catch (error) {
    console.error("Error seeding brands:", error);
  }
};
