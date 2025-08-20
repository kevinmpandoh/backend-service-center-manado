// src/service/service-detail.service.js
import serviceDetailModel from "../model/service-detail.model.js";
import serviceOrderModel from "../model/service-order.model.js";
import repository from "../repository/service-detail.repository.js";
import serviceItemRepository from "../repository/service-item.repository.js";
import serviceOrderRepository from "../repository/service-order.repository.js";
import sparepartRepository from "../repository/sparepart.repository.js";
import { ResponseError } from "../utils/error.js";

const create = async (serviceId, data) => {
  if (data.type === "jasa") {
    const serviceItem = await serviceItemRepository.findById(data.service_item);
    if (!serviceItem) throw new ResponseError(404, "Jasa tidak ditemukan");
    data.price = serviceItem.price;
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

    // Kurangi stok
    sparepart.stock -= data.quantity;
    await sparepart.save();
    data.price = sparepart.sellPrice;
  }
  const subtotal = data.price * data.quantity;
  const detail = await repository.create({
    ...data,
    serviceOrder: serviceId,
    subtotal,
  });

  // update total cost order
  const agg = await serviceDetailModel.aggregate([
    { $match: { serviceOrder: detail.serviceOrder } },
    { $group: { _id: "$serviceOrder", total: { $sum: "$subtotal" } } },
  ]);
  const total = agg[0]?.total || 0;
  await serviceOrderRepository.update(serviceId, { totalCost: total });

  return detail;
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
const getByServiceOrderId = async (id) => {
  const data = await repository.findOne({
    service_item: id,
  });
  if (!data) throw new ResponseError(404, "Detail layanan tidak ditemukan");
  return data;
};

const update = async (id, data) => {
  const existing = await repository.findById(id);
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

  return repository.update(id, data);
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
  getByServiceOrderId,
  update,
  remove,
};
