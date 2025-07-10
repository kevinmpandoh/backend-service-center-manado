// src/service/sparepart.service.js
import sparepartRepository from "../repository/sparepart.repository.js";
import { ResponseError } from "../utils/error.js";

const create = (data) => sparepartRepository.create(data);

const getAll = async ({ page = 1, limit = 10, search = "" }) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  const [total, data] = await Promise.all([
    sparepartRepository.count(query),
    sparepartRepository.find(query, skip, limit),
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
  const part = await sparepartRepository.findById(id);
  if (!part) throw new ResponseError(404, "Sparepart tidak ditemukan");
  return part;
};

const update = async (id, data) => {
  const updated = await sparepartRepository.update(id, data);
  if (!updated) throw new ResponseError(404, "Sparepart tidak ditemukan");
  return updated;
};

const remove = async (id) => {
  const removed = await sparepartRepository.remove(id);
  if (!removed) throw new ResponseError(404, "Sparepart tidak ditemukan");
  return removed;
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
