// src/repository/brand.repository.js
import Brand from "../model/brand.model.js";

const create = (data) => Brand.create(data);
const findAll = () => Brand.find();
const find = (query, skip = 0, limit = 10) =>
  Brand.find(query).skip(skip).limit(limit).sort({ name: 1 });

const count = (query) => Brand.countDocuments(query);
const findById = (id) => Brand.findById(id);
const updateById = (id, data) =>
  Brand.findByIdAndUpdate(id, data, { new: true });
const deleteById = (id) => Brand.findByIdAndDelete(id);

const findByNameAndType = (name, type) => {
  return Brand.findOne({ name, type });
};

export default {
  create,
  findByNameAndType,
  findAll,
  find,
  count,
  findById,
  updateById,
  deleteById,
};
