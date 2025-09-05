// seed/damageType.seeder.js
import DamageType from "../model/damage-type.model.js";

export const seedDamageTypes = async () => {
  const damageTypes = [
    { name: "Software", applicableTo: ["HP", "Laptop"] },
    { name: "Hardware", applicableTo: ["HP", "Laptop"] },
    { name: "Mati Total", applicableTo: ["HP"] },
    { name: "Masuk Air", applicableTo: ["HP", "Laptop"] },
    { name: "IC Charge", applicableTo: ["HP", "Laptop"] },
    { name: "IC Gambar", applicableTo: ["HP", "Laptop"] },
    { name: "Ganti Baterai", applicableTo: ["HP", "Laptop"] },
    { name: "Ganti LCD", applicableTo: ["HP", "Laptop", "Tablet"] },
    { name: "Buka Pola", applicableTo: ["HP"] },
    { name: "Mic/Audio", applicableTo: ["HP"] },
    { name: "Speaker", applicableTo: ["HP", "Laptop"] },
    { name: "Fuse Baterai", applicableTo: ["HP"] },
    { name: "Connector Charge", applicableTo: ["HP"] },
    { name: "No Charging", applicableTo: ["HP"] },
    { name: "Ganti Flexible ON/OFF", applicableTo: ["HP"] },
    { name: "Ganti Mic/Board", applicableTo: ["HP"] },
    { name: "Error/Hang", applicableTo: ["HP", "Laptop", "Tablet"] },
    { name: "Lainnya", applicableTo: ["HP", "Laptop", "Tablet"] },

    { name: "Pasang LCD", applicableTo: ["HP", "Laptop", "Tablet"] },
    { name: "Lem LCD", applicableTo: ["HP"] },
    { name: "Ganti Tombol", applicableTo: ["HP"] },
    { name: "Ganti Papan Charge", applicableTo: ["HP"] },
    { name: "Virus", applicableTo: ["HP", "Laptop"] },
    { name: "Koslet", applicableTo: ["HP", "Laptop"] },
  ];

  await DamageType.deleteMany();
  await DamageType.insertMany(damageTypes);
  console.log("✅ Seeded Damage Types");
};
