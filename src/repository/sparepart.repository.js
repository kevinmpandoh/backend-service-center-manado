// src/repository/sparepart.repository.js
import Sparepart from "../model/sparepart.model.js";

const create = (data) => Sparepart.create(data);

const find = (query = {}, skip = 0, limit = 10) =>
  Sparepart.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

const count = (query = {}) => Sparepart.countDocuments(query);

const findById = (id) => Sparepart.findById(id);

const update = (id, data) =>
  Sparepart.findByIdAndUpdate(id, data, { new: true });

const remove = (id) => Sparepart.findByIdAndDelete(id);

export default {
  create,
  find,
  count,
  findById,
  update,
  remove,
};
