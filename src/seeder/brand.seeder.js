// seeders/userSeeder.ts
import Brand from "../model/brand.model.js";

export const seedBrands = async () => {
  try {
    const deleteResult = await Brand.deleteMany();
    console.log(`Deleted ${deleteResult.deletedCount} brand(s)`);

    // Data user baru untuk diinsert
    const brands = [
      { name: "Samsung", type: "HP" },
      { name: "Oppo", type: "HP" },
      { name: "Vivo", type: "HP" },
      { name: "Realme", type: "HP" },
      { name: "Redmi", type: "HP" },
      { name: "Infinix", type: "HP" },
      { name: "Iphone", type: "HP" },
      { name: "Poco", type: "HP" },
      { name: "Xiaomi", type: "HP" },
      { name: "Itel", type: "HP" },
      { name: "Nokia", type: "HP" },
      { name: "Asus", type: "HP" },
      { name: "Tecno", type: "HP" },
      { name: "Huawei", type: "HP" },
      { name: "Asus", type: "Laptop" },
      { name: "Acer", type: "Laptop" },
      { name: "Lenovo", type: "Laptop" },
      { name: "Axioo", type: "Laptop" },
      { name: "Toshiba", type: "Laptop" },
      { name: "HP", type: "Laptop" },
      { name: "Avita", type: "Laptop" },
      { name: "Advan", type: "Tablet" },
      { name: "Itel", type: "Tablet" },
      { name: "Realme", type: "Tablet" },
      { name: "Samsung", type: "Tablet" },
      { name: "Infinix", type: "Tablet" },
      { name: "Imoo", type: "Jam" },
    ];

    // Menambahkan data user baru ke database
    await Brand.insertMany(brands);
    console.log("Brand seeder completed successfully");
  } catch (error) {
    console.error("Error seeding brands:", error);
  }
};
