// src/service/brand.service.js
import brandRepository from "../repository/brand.repository.js";
import { ResponseError } from "../utils/error.js";

const create = async (data) => {
  const exists = await brandRepository.findAll();
  if (exists.find((b) => b.name.toLowerCase() === data.name.toLowerCase())) {
    throw new ResponseError(400, "Nama brand sudah ada.");
  }
  return brandRepository.create(data);
};

const getAll = async ({ page = 1, search = "", type }) => {
  page = parseInt(page);

  const skip = page - 1;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (type) {
    query.type = type;
  }

  const [total, data] = await Promise.all([
    brandRepository.count(query),
    brandRepository.find(query, skip),
  ]);

  return {
    data,
    pagination: {
      total,
      page,

      totalPages: Math.ceil(total),
    },
  };
};

const getById = async (id) => {
  const brand = await brandRepository.findById(id);
  if (!brand) throw new ResponseError(404, "Brand tidak ditemukan");
  return brand;
};

const update = async (id, data) => {
  const updated = await brandRepository.updateById(id, data);
  if (!updated) throw new ResponseError(404, "Brand tidak ditemukan");
  return updated;
};

const remove = async (id) => {
  const deleted = await brandRepository.deleteById(id);
  if (!deleted) throw new ResponseError(404, "Brand tidak ditemukan");
  return deleted;
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
