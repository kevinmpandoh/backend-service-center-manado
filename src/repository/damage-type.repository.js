// src/repository/damage-type.repository.js
import DamageType from "../model/damage-type.model.js";

const create = (data) => DamageType.create(data);

const find = (query, skip = 0, limit = 10) =>
  DamageType.find(query).skip(skip).limit(limit).sort({ name: 1 });

const count = (query) => DamageType.countDocuments(query);

const findById = (id) => DamageType.findById(id);

const update = (id, data) =>
  DamageType.findByIdAndUpdate(id, data, { new: true });

const remove = (id) => DamageType.findByIdAndDelete(id);

export default {
  create,
  find,
  count,
  findById,
  update,
  remove,
};
