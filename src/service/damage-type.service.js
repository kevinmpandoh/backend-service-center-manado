// src/service/damage-type.service.js
import damageTypeRepository from "../repository/damage-type.repository.js";
import { ResponseError } from "../utils/error.js";

const create = async (data) => {
  const exists = await damageTypeRepository.find({ name: data.name });
  if (exists.length) throw new ResponseError(400, "Jenis kerusakan sudah ada");

  return damageTypeRepository.create(data);
};

const getAll = async ({ page = 1, limit = 10, search = "", applicableTo }) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (applicableTo) {
    query.applicableTo = { $in: [applicableTo] };
  }

  const [total, data] = await Promise.all([
    damageTypeRepository.count(query),
    damageTypeRepository.find(query, skip, limit),
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
  const result = await damageTypeRepository.findById(id);
  if (!result) throw new ResponseError(404, "Jenis kerusakan tidak ditemukan");
  return result;
};

const update = async (id, data) => {
  const result = await damageTypeRepository.update(id, data);
  if (!result) throw new ResponseError(404, "Jenis kerusakan tidak ditemukan");
  return result;
};

const remove = async (id) => {
  const result = await damageTypeRepository.remove(id);
  if (!result) throw new ResponseError(404, "Jenis kerusakan tidak ditemukan");
  return result;
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
