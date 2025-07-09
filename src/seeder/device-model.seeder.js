// seed/deviceModel.seeder.js
import DeviceModel from "../model/device-model.model.js";
import Brand from "../model/brand.model.js";

export const seedDeviceModels = async () => {
  const models = [
    { name: "Vivobook A14", brandName: "Asus" },
    { name: "Aspire 5", brandName: "Acer" },
    { name: "Galaxy A12", brandName: "Samsung" },
    { name: "Redmi Note 8", brandName: "Xiaomi" },
  ];

  const brands = await Brand.find();
  const brandMap = {};
  brands.forEach((b) => (brandMap[b.name] = b._id));

  const modelData = models.map((m) => ({
    name: m.name,
    brand: brandMap[m.brandName],
  }));

  await DeviceModel.deleteMany();
  await DeviceModel.insertMany(modelData);
  console.log("✅ Seeded Device Models");
};
