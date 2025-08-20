// src/repository/service-detail.repository.js

import mongoose from "mongoose";
import serviceItemModel from "../model/service-item.model.js";

const create = (data) => serviceItemModel.create(data);

const find = (query = {}, skip = 0, limit = 20) =>
  serviceItemModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

const count = (query = {}) => serviceItemModel.countDocuments(query);

const findById = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  return serviceItemModel.findById(id);
};

const update = (id, data) =>
  serviceItemModel.findByIdAndUpdate(id, data, { new: true });
const remove = (id) => serviceItemModel.findByIdAndDelete(id);

export default {
  create,
  find,
  count,
  findById,
  update,
  remove,
};
