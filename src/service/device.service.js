// src/service/device.service.js
import deviceRepository from "../repository/device.repository.js";
import { ResponseError } from "../utils/error.js";

const create = async (data) => deviceRepository.create(data);

const getAll = async ({
  page = 1,
  limit = 10,
  search = "",
  customer,
  type,
}) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const query = {};

  if (customer) query.customer = customer;
  if (type) query.type = type;
  if (search) {
    query.notes = { $regex: search, $options: "i" }; // keluhan pelanggan
  }

  const [total, data] = await Promise.all([
    deviceRepository.count(query),
    deviceRepository.find(query, skip, limit),
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
  const result = await deviceRepository.findById(id);
  if (!result) throw new ResponseError(404, "Perangkat tidak ditemukan");
  return result;
};

const update = async (id, data) => {
  const result = await deviceRepository.update(id, data);
  if (!result) throw new ResponseError(404, "Perangkat tidak ditemukan");
  return result;
};

const remove = async (id) => {
  const result = await deviceRepository.softDelete(id);
  if (!result) throw new ResponseError(404, "Perangkat tidak ditemukan");
  return result;
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
