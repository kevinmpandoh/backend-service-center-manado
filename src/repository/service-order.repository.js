// src/repository/service-order.repository.js
import ServiceOrder from "../model/service-order.model.js";

const create = (data) => ServiceOrder.create(data);

// const find = async (query, skip, limit, search) => {
//   let mongoQuery = ServiceOrder.find(query)
//     .populate("device.brand", "name")
//     .populate("device.model", "name")
//     .populate("damage", "name")
//     .populate("serviceDetails")
//     .skip(skip)
//     .limit(limit)
//     .sort({ createdAt: -1 });

//   // kalau ada search
//   if (search && search.trim() !== "") {
//     const regex = new RegExp(search, "i"); // case-insensitive
//     mongoQuery = mongoQuery.find({
//       $or: [
//         { "customer.name": regex },
//         { "customer.phone": regex },
//         { customDamageNote: regex },
//         // kalau populate, harus pakai $lookup / aggregate kalau mau filter di DB level
//       ],
//     });
//   }

//   return await mongoQuery.exec();
// };

const aggregate = async (pipeline) => {
  return await ServiceOrder.aggregate(pipeline);
};

const find = (query = {}, skip = 0, limit = 10) =>
  ServiceOrder.find(query)
    .populate([
      {
        path: "device",
        populate: [
          {
            path: "brand",
          },
          {
            path: "model",
          },
        ],
      },
      {
        path: "payments",
      },
      {
        path: "serviceDetails",
      },
      {
        path: "damage",
      },
    ])
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

const count = (query = {}) => ServiceOrder.countDocuments(query);

const findById = (id) =>
  ServiceOrder.findById(id)
    .populate("device.brand")
    .populate("device.model")
    .populate("technician")
    .populate("damage")
    .populate({
      path: "serviceDetails",
      populate: [{ path: "sparepart" }, { path: "serviceItem" }],
    })
    .populate("payments");

const update = (id, data) =>
  ServiceOrder.findByIdAndUpdate(id, data, { new: true }).populate(
    "device technician"
  );

const remove = (id) => ServiceOrder.findByIdAndDelete(id);

export default {
  create,
  aggregate,
  find,
  count,
  findById,
  update,
  remove,
};
