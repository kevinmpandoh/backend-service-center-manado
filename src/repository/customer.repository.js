// src/repository/customer.repository.js
import Customer from "../model/customer.model.js";

const create = (data) => Customer.create(data);

const find = (query, skip = 0, limit = 10) =>
  Customer.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

const count = (query) => Customer.countDocuments(query);

const findById = (id) => Customer.findById(id);

const update = (id, data) =>
  Customer.findByIdAndUpdate(id, data, { new: true });

const remove = (id) => Customer.findByIdAndDelete(id);

export default {
  create,
  find,
  count,
  findById,
  update,
  remove,
};
