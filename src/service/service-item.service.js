// src/service/sparepart.service.js

import serviceItemRepository from "../repository/service-item.repository.js";
import { ResponseError } from "../utils/error.js";

const create = (data) => serviceItemRepository.create(data);

const getAll = async ({ page = 1, limit = 10, search = "" }) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  const [total, data] = await Promise.all([
    serviceItemRepository.count(query),
    serviceItemRepository.find(query, skip, limit),
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
  const part = await serviceItemRepository.findById(id);
  if (!part) throw new ResponseError(404, "Jasa tidak ditemukan");
  return part;
};

const update = async (id, data) => {
  const updated = await serviceItemRepository.update(id, data);
  if (!updated) throw new ResponseError(404, "Jasa tidak ditemukan");
  return updated;
};

const remove = async (id) => {
  const removed = await serviceItemRepository.remove(id);
  if (!removed) throw new ResponseError(404, "Jasa tidak ditemukan");
  return removed;
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
