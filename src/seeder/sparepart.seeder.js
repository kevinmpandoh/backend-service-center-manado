// seed/sparepart.seeder.js
import Sparepart from "../model/sparepart.model.js";

export const seedSpareparts = async () => {
  const spareparts = [
    {
      name: "LCD Redmi Note 8",
      brand: "Xiaomi",
      stock: 10,
      buyPrice: 250000,
      sellPrice: 350000,
    },
    {
      name: "Keyboard Laptop Asus",
      brand: "Asus",
      stock: 5,
      buyPrice: 100000,
      sellPrice: 180000,
    },
  ];

  await Sparepart.deleteMany();
  await Sparepart.insertMany(spareparts);
  console.log("✅ Seeded Spareparts");
};
