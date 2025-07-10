// src/service/payment.service.js
import { ResponseError } from "../utils/error.js";
import paymentRepository from "../repository/payment.repository.js";
import serviceOrderRepository from "../repository/service-order.repository.js";

const create = async (data) => {
  const serviceOrder = await serviceOrderRepository.findById(data.serviceOrder);
  if (!serviceOrder) {
    throw new ResponseError(404, "Service order tidak ditemukan");
  }

  // Validasi jumlah pembayaran
  if (data.amount < serviceOrder.totalCost) {
    throw new ResponseError(400, "Jumlah pembayaran kurang dari total biaya");
  }

  // Jika metode transfer, bukti wajib
  if (data.method === "transfer" && !data.proofImage) {
    throw new ResponseError(400, "Bukti transfer wajib diunggah");
  }

  return paymentRepository.create(data);
};

const findAll = async () => {
  return paymentRepository.findAll();
};

const findById = async (id) => {
  const payment = await paymentRepository.findById(id);
  if (!payment) throw new ResponseError(404, "Data pembayaran tidak ditemukan");
  return payment;
};

const getReceipt = async (id) => {
  const payment = await Payment.findById(id).populate({
    path: "serviceOrder",
    populate: {
      path: "device",
      populate: [{ path: "customer" }, { path: "brand" }, { path: "model" }],
    },
  });

  if (!payment) throw new ResponseError(404, "Pembayaran tidak ditemukan");

  return payment;
};

const update = async (id, data) => {
  const payment = await paymentRepository.update(id, data);
  if (!payment) throw new ResponseError(404, "Gagal memperbarui pembayaran");
  return payment;
};

const remove = async (id) => {
  const deleted = await paymentRepository.remove(id);
  if (!deleted) throw new ResponseError(404, "Data pembayaran tidak ditemukan");
  return deleted;
};

export default {
  create,
  findAll,
  findById,
  getReceipt,
  update,
  remove,
};
