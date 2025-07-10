// src/repository/service-order.repository.js
import ServiceOrder from "../model/service-order.model.js";

const create = (data) => ServiceOrder.create(data);

const find = (query = {}, skip = 0, limit = 10) =>
  ServiceOrder.find(query)
    .populate("device technician")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

const count = (query = {}) => ServiceOrder.countDocuments(query);

const findById = (id) =>
  ServiceOrder.findById(id).populate("device technician");

const update = (id, data) =>
  ServiceOrder.findByIdAndUpdate(id, data, { new: true }).populate(
    "device technician"
  );

const remove = (id) => ServiceOrder.findByIdAndDelete(id);

export default {
  create,
  find,
  count,
  findById,
  update,
  remove,
};
