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
    if (data.serviceItem) {
      // Jasa dari database
      const serviceItem = await serviceItemRepository.findById(
        data.serviceItem
      );
      if (!serviceItem) throw new ResponseError(404, "Jasa tidak ditemukan");

      data.price = serviceItem.price;
    } else {
      // Jasa custom manual dari teknisi
      if (!data.customServiceName || !data.customPrice) {
        throw new ResponseError(400, "Nama jasa dan harga harus diisi");
      }
      data.customServiceName = data.customServiceName;
      data.customPrice = data.customPrice;
    }
    data.quantity = 1;
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

  const subtotal = (data.price || data.customPrice) * (data.quantity || 1);

  const detail = await repository.create({
    ...data,
    serviceOrder: serviceId,
    subtotal,
  });

  // Update total cost order (sum semua detail)
  const agg = await serviceDetailModel.aggregate([
    { $match: { serviceOrder: detail.serviceOrder } },
    { $group: { _id: "$serviceOrder", total: { $sum: "$subtotal" } } },
  ]);
  const total = agg[0]?.total || 0;
  await serviceOrderRepository.update(serviceId, {
    $push: {
      serviceDetails: detail._id,
    },
    totalCost: total,
  });

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
  const detail = await repository.findById(id);
  if (!detail) throw new ResponseError(404, "Service detail tidak ditemukan");

  if (detail.type === "sparepart") {
    const sparepart = await sparepartRepository.findById(detail.sparepart);
    if (!sparepart) throw new ResponseError(404, "Sparepart tidak ditemukan");

    // Kembalikan stok lama dulu
    sparepart.stock += detail.quantity;

    // Validasi stok baru
    if (sparepart.stock < data.quantity) {
      throw new ResponseError(
        400,
        `Stok sparepart "${sparepart.name}" tidak mencukupi`
      );
    }

    // Kurangi stok sesuai quantity baru
    sparepart.stock -= data.quantity;
    await sparepart.save();

    detail.quantity = data.quantity;
    detail.price = sparepart.sellPrice;
    detail.subtotal = detail.price * detail.quantity;
  }

  if (detail.type === "jasa") {
    if (data.serviceItem) {
      // update dari master service item
      detail.serviceItem = data.serviceItem._id;
      detail.customServiceName = data.serviceItem.name;
      detail.price = data.serviceItem.price;
    } else if (data.customServiceName && data.customPrice) {
      // update manual
      detail.customServiceName = data.customServiceName;
      detail.price = data.customPrice;
    }
    detail.subtotal = detail.price * (data.quantity || 1);
  }

  await detail.save();

  // Update total order
  const agg = await serviceDetailModel.aggregate([
    { $match: { serviceOrder: detail.serviceOrder } },
    { $group: { _id: "$serviceOrder", total: { $sum: "$subtotal" } } },
  ]);
  const total = agg[0]?.total || 0;

  await serviceOrderRepository.update(detail.serviceOrder, {
    totalCost: total,
  });

  return detail;
};

const remove = async (id) => {
  const detail = await repository.findById(id);
  if (!detail) throw new ResponseError(404, "Service detail tidak ditemukan");

  if (detail.type === "sparepart") {
    const sparepart = await sparepartRepository.findById(detail.sparepart);
    if (sparepart) {
      // Kembalikan stok
      sparepart.stock += detail.quantity;
      await sparepart.save();
    }
  }

  await repository.remove(id);

  // Update total order
  const agg = await serviceDetailModel.aggregate([
    { $match: { serviceOrder: detail.serviceOrder } },
    { $group: { _id: "$serviceOrder", total: { $sum: "$subtotal" } } },
  ]);
  const total = agg[0]?.total || 0;
  await serviceOrderRepository.update(detail.serviceOrder, {
    totalCost: total,
  });

  return { message: "Service detail berhasil dihapus" };
};

export default {
  create,
  getAll,
  getById,
  getByServiceOrderId,
  update,
  remove,
};
