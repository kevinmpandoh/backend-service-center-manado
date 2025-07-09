// seed/customer.seeder.js
import Customer from "../model/customer.model.js";

export const seedCustomers = async () => {
  const customers = [
    {
      name: "Budi Santoso",
      phone: "081234567890",
      email: "budi@gmail.com",
      address: "Jl. Anggrek No. 12, Manado",
    },
    {
      name: "Siti Aminah",
      phone: "082345678901",
      email: "siti@gmail.com",
      address: "Jl. Mawar No. 21, Manado",
    },
  ];

  await Customer.deleteMany();
  await Customer.insertMany(customers);
  console.log("✅ Seeded Customers");
};
