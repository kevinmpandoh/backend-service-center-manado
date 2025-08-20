// src/service/service-order.service.js
import e from "express";
import customerRepository from "../repository/customer.repository.js";
import deviceRepository from "../repository/device.repository.js";
import paymentRepository from "../repository/payment.repository.js";
import serviceOrderRepository from "../repository/service-order.repository.js";
import { ResponseError } from "../utils/error.js";
import { sendWhatsApp } from "./notification.service.js";
import serviceDetailRepository from "../repository/service-detail.repository.js";

const create = async (technicianId, data) => {
  const customer = await customerRepository.create({
    name: data.customer.name,
    phone: data.customer.phone,
  });
  const device = await deviceRepository.create({
    customer: customer._id,
    type: data.device.type,
    brand: data.device.brand,
    model: data.device.model,
    completeness: data.device.completeness,
  });
  const order = await serviceOrderRepository.create({
    device: device._id,
    technician: technicianId,
    damageLevel: data.damageLevel,
    damageIds: data.damageIds,
    customDamageNote: data.customDamageNote,
    status: "diterima",
    estimatedCost: data.estimatedCost,
    estimatedTime: data.estimatedTime,
    notes: data.notes,
    serviceNotes: data.serviceNotes,
    receivedAt: new Date(),
  });

  if (data.payment) {
    await paymentRepository.create(order._id, data.payment);
  }

  return order;
};

const startWork = async (orderId) => {
  return serviceOrderRepository.update(orderId, {
    status: "diperbaiki",
    startedAt: new Date(),
  });
};

const markAsCompleted = async (id) => {
  const order = await serviceOrderRepository.findById(id).populate({
    path: "device",
    populate: { path: "customer" },
  });

  if (!order) throw new ResponseError(404, "Order tidak ditemukan");

  // cek apakah ada minimal 1 jasa service
  const hasService = await serviceDetailRepository.findOne({
    serviceOrder: id,
    type: "jasa",
  });
  if (!hasService) {
    throw new ResponseError(
      400,
      "Minimal 1 jasa perbaikan diperlukan sebelum menyelesaikan order"
    );
  }
  let newStatus = "menunggu_pembayaran";
  if (order.totalPaid >= order.totalCost) newStatus = "siap_diambil";

  const newOrder = serviceOrderRepository.update(id, { status: newStatus });

  // Kirim notifikasi otomatis
  const phone = order.device.customer.phone;
  const name = order.device.customer.name;
  const msg = `Halo ${name}, service perangkat Anda telah selesai. Silakan datang untuk pengambilan.`;

  await sendWhatsApp(phone, msg);

  return newOrder;
};

const markAsPickedUp = async (id) => {
  const order = await serviceOrderRepository.findById(id).populate({
    path: "device",
    populate: { path: "customer" },
  });

  if (!order) throw new ResponseError(404, "Order tidak ditemukan");

  order.status = "diambil";
  order.pickedUpAt = new Date();
  await order.save();

  // Kirim notifikasi otomatis
  const phone = order.device.customer.phone;
  const name = order.device.customer.name;
  const msg = `Terima kasih ${name}, perangkat Anda sudah diambil. Jika ada kendala, silakan hubungi kami`;

  await sendWhatsApp(phone, msg);

  return order;
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

  const serviceDetail = await serviceDetailRepository.find({
    serviceOrder: { $in: data.map((item) => item._id) },
  });

  console.log(serviceDetail, "Service Detail");

  const filteredData = data.map((item) => ({
    id: item._id,
    customerName: item.device?.customer?.name,
    customerPhone: item.device?.customer?.phone,
    deviceType: item.device?.type,
    deviceBrand: item.device?.brand?.name,
    deviceModel: item.device?.model?.name,
    damageLevel: item.damageLevel,
    totalCost: item.totalCost,
    totalPaid: item.totalPaid,
    serviceDetails: serviceDetail
      .filter(
        (detail) => detail.serviceOrder._id.toString() === item._id.toString()
      )
      .map((detail) => ({
        id: detail._id,
        type: detail.type,
        name: detail.name,
        price: detail.price,
        description: detail.description,
        sparepart: detail.sparepart?.name,
        serviceItem: detail.serviceItem,
      })),

    status: item.status,
    createdAt: item.createdAt,
  }));

  return {
    data: filteredData,
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
  markAsPickedUp,
  markAsCompleted,
  getAll,
  getById,
  update,
  remove,
  startWork,
};
