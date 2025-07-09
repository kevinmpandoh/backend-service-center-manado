// seed/damageType.seeder.js
import DamageType from "../model/damage-type.model.js";

export const seedDamageTypes = async () => {
  const damageTypes = [
    { name: "LCD pecah", applicableTo: ["HP", "Laptop"] },
    { name: "Tidak bisa dicas", applicableTo: ["HP", "Laptop"] },
    { name: "Bootloop", applicableTo: ["HP"] },
    { name: "Overheating", applicableTo: ["Laptop"] },
  ];

  await DamageType.deleteMany();
  await DamageType.insertMany(damageTypes);
  console.log("✅ Seeded Damage Types");
};
