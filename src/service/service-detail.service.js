// src/service/service-detail.service.js
import repository from "../repository/service-detail.repository.js";
import sparepartRepository from "../repository/sparepart.repository.js";
import { ResponseError } from "../utils/error.js";

const create = async (data) => {
  if (data.type === "sparepart") {
    const sparepart = await sparepartRepository.findById(data.sparepart);
    if (!sparepart) {
      throw new ResponseError(404, "Sparepart tidak ditemukan");
    }

    if (sparepart.stock < data.quantity) {
      throw new ResponseError(
        400,
        `Stok sparepart "${sparepart.name}" tidak mencukupi`
      );
    }

    // Kurangi stok
    sparepart.stock -= data.quantity;
    await sparepart.save();
    data.price = sparepart.sellPrice;
  }

  return repository.create(data);
};

const getAll = async ({ page = 1, limit = 20, serviceOrder }) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const query = {};
  if (serviceOrder) query.serviceOrder = serviceOrder;

  const [total, data] = await Promise.all([
    repository.count(query),
    repository.find(query, skip, limit),
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
  const data = await repository.findById(id);
  if (!data) throw new ResponseError(404, "Detail layanan tidak ditemukan");
  return data;
};

const update = async (id, data) => {
  const existing = await serviceDetailRepository.findById(id);
  if (!existing) {
    throw new ResponseError(404, "Detail layanan tidak ditemukan");
  }

  // Handle stok sparepart jika type = sparepart
  if (existing.type === "sparepart") {
    const sparepart = await sparepartRepository.findById(existing.sparepart);
    if (sparepart) {
      // Kembalikan stok sebelumnya
      sparepart.stock += existing.quantity;
      await sparepart.save();
    }
  }

  if (data.type === "sparepart") {
    const sparepart = await sparepartRepository.findById(data.sparepart);
    if (!sparepart) {
      throw new ResponseError(404, "Sparepart tidak ditemukan");
    }

    if (sparepart.stock < data.quantity) {
      throw new ResponseError(
        400,
        `Stok sparepart "${sparepart.name}" tidak mencukupi`
      );
    }

    // Kurangi stok baru
    sparepart.stock -= data.quantity;
    await sparepart.save();

    // Set harga otomatis
    data.price = sparepart.sellPrice;
  }

  return serviceDetailRepository.update(id, data);
};

const remove = async (id) => {
  const deleted = await repository.remove(id);
  if (!deleted) throw new ResponseError(404, "Detail layanan tidak ditemukan");
  return deleted;
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
