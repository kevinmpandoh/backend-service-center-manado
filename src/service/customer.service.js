// src/service/customer.service.js
import customerRepository from "../repository/customer.repository.js";
import { ResponseError } from "../utils/error.js";

const create = async (data) => {
  return customerRepository.create(data);
};

const getAll = async ({ page = 1, limit = 10, search = "" }) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const [total, data] = await Promise.all([
    customerRepository.count(query),
    customerRepository.find(query, skip, limit),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getById = async (id) => {
  const customer = await customerRepository.findById(id);
  if (!customer) throw new ResponseError(404, "Pelanggan tidak ditemukan");
  return customer;
};

const update = async (id, data) => {
  const updated = await customerRepository.update(id, data);
  if (!updated) throw new ResponseError(404, "Pelanggan tidak ditemukan");
  return updated;
};

const remove = async (id) => {
  const deleted = await customerRepository.remove(id);
  if (!deleted) throw new ResponseError(404, "Pelanggan tidak ditemukan");
  return deleted;
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
