// src/repository/device.repository.js
import Device from "../model/device.model.js";

const create = (data) => Device.create(data);

const find = (query = {}, skip = 0, limit = 10) =>
  Device.find({ ...query, isDeleted: false })
    .populate("customer brand model damageIds")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

const count = (query = {}) =>
  Device.countDocuments({ ...query, isDeleted: false });

const findById = (id) =>
  Device.findOne({ _id: id, isDeleted: false }).populate(
    "customer brand model damageIds"
  );

const update = (id, data) =>
  Device.findByIdAndUpdate(id, data, { new: true }).populate(
    "customer brand model damageIds"
  );

const softDelete = (id) =>
  Device.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

export default {
  create,
  find,
  count,
  findById,
  update,
  softDelete,
};
