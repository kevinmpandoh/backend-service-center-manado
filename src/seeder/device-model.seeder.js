import deviceModelModel from "../model/device-model.model.js";
import Brand from "../model/brand.model.js";

export const seedDeviceModels = async () => {
  const data = [
    { brand: "Asus", type: "Laptop", models: ["ROG Strix", "Vivobook"] },
    {
      brand: "Asus",
      type: "HP",
      models: [
        "Zenfone 9",
        "ROG Phone 7",
        "Max Plus M1",
        "Max Pro M1",
        "Max Pro M2",
        "ZF 3",
      ],
    },
    { brand: "Huawei", type: "HP", models: ["Honor", "Nova 5T", "Y7"] },
    {
      brand: "Xiaomi",
      type: "HP",
      models: ["Mi 10 T", "Mi 10 T Pro", "Mi 12"],
    },
    {
      brand: "Samsung",
      type: "HP",
      models: [
        "A11",
        "A12",
        "A13",
        "A51",
        "A52",
        "Flip 4",
        "J2 Pro",
        "J5 Prime",
        "Note 10 Plus",
        "S 21 Plus",
      ],
    },
    {
      brand: "Itel",
      type: "HP",
      models: ["A05", "A49", "A50", "A60", "A70", "P40", "S23", "S25"],
    },
    {
      brand: "Tecno",
      type: "HP",
      models: ["Park 50", "Pova", "Pova 4", "Spark", "19 Pro"],
    },
    {
      brand: "Vivo",
      type: "HP",
      models: [
        "A 01",
        "A13",
        "A14",
        "A15",
        "A16",
        "A17",
        "V11",
        "V11 Pro",
        "V12",
        "V17",
      ],
    },
    {
      brand: "Nokia",
      type: "HP",
      models: ["5", "105", "C20", "Experia"],
    },
    {
      brand: "Oppo",
      type: "HP",
      models: ["10", "11", "2F", "9", "A01", "A02", "A11", "A12"],
    },
    {
      brand: "Poco",
      type: "HP",
      models: ["F4", "F5", "X5", "X6", "M4", "M4 Pro", "F6", "X6"],
    },
    {
      brand: "Realme",
      type: "HP",
      models: ["10", "2 Pro", "3", "3 Pro", "5 Pro", "6 Pro", "7 Pro", "8 Pro"],
    },
    {
      brand: "Redmi",
      type: "HP",
      models: [
        "10A",
        "10C",
        "10S",
        "Note 10 Pro",
        "Note 11",
        "Note 11 Pro",
        "Note 12 Pro",
        "Note 13",
      ],
    },
    {
      brand: "Infinix",
      type: "HP",
      models: [
        "A01",
        "A05",
        "A12",
        "A15",
        "A3S",
        "A51",
        "A54",
        "A57",
        "A5S",
        "C11",
        "C21Y",
        "C33",
        "C51",
        "GT 10 Pro",
        "GT 20 Pro",
        "Hot 10",
        "Hot 10",
        "Hot 12",
        "Hot 11",
        "Hot 12",
        "Hot 12 Pro",
        "Note 10 Pro",
        "Note 11",
        "Note 12",
        "Note 30",
        "Note 30I",
      ],
    },
    { brand: "Apple", type: "HP", models: ["iPhone 14", "iPhone 15 Pro"] },
    { brand: "Apple", type: "HP", models: ["iPhone 14", "iPhone 15 Pro"] },
    {
      brand: "Asus",
      type: "Laptop",
      models: ["Rog Strix", "Tuf Gaming", "Vivobook"],
    },
    {
      brand: "Acer",
      type: "Laptop",
      models: ["Nitro 16", "Predator", "Aspire"],
    },
    {
      brand: "Lenovo",
      type: "Laptop",
      models: ["Nitro 16", "Predator", "Aspire"],
    },
    {
      brand: "Axioo",
      type: "Laptop",
      models: ["Mybook Hype 3", "Hype 5", "MyBook Z6 Metal"],
    },
    {
      brand: "Toshiba",
      type: "Laptop",
      models: ["C800", "Satelite C600", "Satelite I740"],
    },
    {
      brand: "HP",
      type: "Laptop",
      models: ["14S", "Omen 16", "Envy x360"],
    },
    {
      brand: "Avita",
      type: "Laptop",
      models: ["Essential 14"],
    },
    { brand: "Imoo", type: "Jam", models: ["Z7", "Z9"] },
    {
      brand: "Samsung",
      type: "Tablet",
      models: ["Galaxy Tab S9", "Galaxy Tab A8"],
    },
    {
      brand: "Realme",
      type: "Tablet",
      models: ["Pad Mini"],
    },
    {
      brand: "Advan",
      type: "Tablet",
      models: ["Tab 8001"],
    },
  ];

  for (const item of data) {
    const brand = await Brand.findOne({
      name: item.brand,
      type: item.type,
    });
    if (!brand) {
      console.warn(`⚠️ Brand not found: ${item.brand} (${item.type})`);
      continue;
    }

    for (const modelName of item.models) {
      const exists = await deviceModelModel.findOne({
        name: modelName,
        brand: brand._id,
      });
      if (!exists) {
        await deviceModelModel.create({ name: modelName, brand: brand._id });
        console.log(
          `✅ Inserted model: ${modelName} (${item.brand} - ${item.type})`
        );
      }
    }
  }
};
