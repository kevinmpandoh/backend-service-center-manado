// src/service/device-model.service.js
import deviceModelRepository from "../repository/device-model.repository.js";
import brandRepository from "../repository/brand.repository.js";
import { ResponseError } from "../utils/error.js";

const create = async (data) => {
  const brand = await brandRepository.findById(data.brand);
  if (!brand) throw new ResponseError(404, "Brand tidak ditemukan");

  return deviceModelRepository.create(data);
};

const getAll = async ({ page = 1, limit = 10, search = "", brand }) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (brand) {
    query.brand = brand;
  }

  const [total, data] = await Promise.all([
    deviceModelRepository.count(query),
    deviceModelRepository.find(query, skip, limit),
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
  const deviceModel = await deviceModelRepository.findById(id);
  if (!deviceModel)
    throw new ResponseError(404, "Device model tidak ditemukan");
  return deviceModel;
};

const update = async (id, data) => {
  if (data.brand) {
    const brand = await brandRepository.findById(data.brand);
    if (!brand) throw new ResponseError(404, "Brand tidak ditemukan");
  }

  const updated = await deviceModelRepository.update(id, data);
  if (!updated) throw new ResponseError(404, "Device model tidak ditemukan");
  return updated;
};

const remove = async (id) => {
  const deleted = await deviceModelRepository.remove(id);
  if (!deleted) throw new ResponseError(404, "Device model tidak ditemukan");
  return deleted;
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
