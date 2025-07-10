// src/repository/device-model.repository.js
import DeviceModel from "../model/device-model.model.js";

const create = (data) => DeviceModel.create(data);

const find = (query, skip = 0, limit = 10) =>
  DeviceModel.find(query)
    .populate("brand")
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });

const count = (query) => DeviceModel.countDocuments(query);

const findById = (id) => DeviceModel.findById(id).populate("brand");

const update = (id, data) =>
  DeviceModel.findByIdAndUpdate(id, data, { new: true }).populate("brand");

const remove = (id) => DeviceModel.findByIdAndDelete(id);

export default {
  create,
  find,
  count,
  findById,
  update,
  remove,
};
