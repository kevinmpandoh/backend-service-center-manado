// src/service/service-order.service.js
import serviceOrderRepository from "../repository/service-order.repository.js";
import { ResponseError } from "../utils/error.js";

const create = async (data) => {
  if (data.warrantyDuration && data.completedAt) {
    const completed = new Date(data.completedAt);
    data.warrantyExpiredAt = new Date(
      completed.getTime() + data.warrantyDuration * 24 * 60 * 60 * 1000
    );
  }
  return serviceOrderRepository.create(data);
};

const getAll = async ({ page = 1, limit = 10, search = "", status }) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const query = {};
  if (status) query.status = status;

  const [total, data] = await Promise.all([
    serviceOrderRepository.count(query),
    serviceOrderRepository.find(query, skip, limit),
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
  const result = await serviceOrderRepository.findById(id);
  if (!result) throw new ResponseError(404, "Service order tidak ditemukan");
  return result;
};

const update = async (id, data) => {
  if (data.warrantyDuration && data.completedAt) {
    const completed = new Date(data.completedAt);
    data.warrantyExpiredAt = new Date(
      completed.getTime() + data.warrantyDuration * 24 * 60 * 60 * 1000
    );
  }
  const result = await serviceOrderRepository.update(id, data);
  if (!result) throw new ResponseError(404, "Service order tidak ditemukan");
  return result;
};

const remove = async (id) => {
  const result = await serviceOrderRepository.remove(id);
  if (!result) throw new ResponseError(404, "Service order tidak ditemukan");
  return result;
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
