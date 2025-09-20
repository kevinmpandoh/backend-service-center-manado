// src/repository/device-model.repository.js
import DeviceModel from "../model/device-model.model.js";

const create = (data) => DeviceModel.create(data);

const find = (query, skip = 0, limit = 10) =>
  DeviceModel.aggregate([
    {
      $lookup: {
        from: "brands", // nama collection Brand
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    { $unwind: "$brand" }, // biar brand jadi object, bukan array
    {
      $match: query, // query bisa pakai field dari brand juga
    },
    { $sort: { name: 1 } },
    { $skip: skip },
    { $limit: limit },
  ]);
// const count = (query) => DeviceModel.countDocuments(query);

const findById = (id) => DeviceModel.findById(id).populate("brand");

const update = (id, data) =>
  DeviceModel.findByIdAndUpdate(id, data, { new: true }).populate("brand");

const remove = (id) => DeviceModel.findByIdAndDelete(id);

const count = (query) =>
  DeviceModel.aggregate([
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    { $unwind: "$brand" },
    { $match: query },
    { $count: "total" },
  ]).then((res) => res[0]?.total || 0);

export default {
  create,
  find,
  count,
  findById,
  update,
  remove,
};
