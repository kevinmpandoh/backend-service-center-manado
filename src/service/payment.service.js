// src/service/payment.service.js
import { ResponseError } from "../utils/error.js";
import paymentRepository from "../repository/payment.repository.js";
import serviceOrderRepository from "../repository/service-order.repository.js";
import { streamUpload } from "../config/cloudinary.js";
import { sendWhatsApp } from "./notification.service.js";

const create = async (orderId, data) => {
  const order = await serviceOrderRepository.findById(orderId);
  if (!order) throw new ResponseError(404, "Service order not found");

  // Jika metode transfer, bukti wajib
  if (data.paymentMethod === "transfer" && !data.paymentProof) {
    throw new ResponseError(400, "Bukti pembayaran harus diisi jika transfer");
  }

  const payment = await paymentRepository.create({
    serviceOrder: orderId,
    method: data.paymentMethod,
    amount: data.amount || order.totalCost,
    paymentProof: data.paymentProof || null,
  });

  // push ke service order
  order.payments.push(payment._id);

  // update totalPaid
  order.totalPaid = (order.totalPaid || 0) + (data.amount || order.totalCost);

  // update status jika sudah lunas
  if (order.totalPaid >= order.totalCost) {
    order.status = "siap diambil";
  }

  await order.save();

  await sendWhatsApp(
    order.customer.phone,
    `Pembayaran sebesar Rp ${payment.amount.toLocaleString(
      "id-ID"
    )} untuk service order Anda telah diterima. Terima kasih!`
  );

  return payment;
};

const addPaymentDP = async (orderId, data, file) => {
  const order = await ServiceOrder.findById(orderId);
  if (!order) throw new ResponseError(404, "Service Order not found");

  if (data.method === "TRANSFER" && !file) {
    throw new ResponseError(400, "Proof of transfer required");
  }

  if (file) {
    const uploaded = await streamUpload(file.buffer);
    data.proof_url = uploaded.secure_url;
  }

  const payment = await repo.createPayment(orderId, {
    amount: data.amount,
    type: "DP",
    method: data.method,
    proof_url: data.proof_url,
  });

  return payment;
};

const addPaymentFinal = async (orderId, data, file) => {
  const order = await serviceOrderRepository.findById(orderId);
  if (!order) throw new ResponseError(404, "Service Order not found");

  const remaining = order.totalCost - order.totalPaid;
  if (remaining <= 0) {
    throw new ResponseError(400, "No remaining amount to pay");
  }

  if (data.method === "TRANSFER" && !file) {
    throw new ResponseError(400, "Proof of transfer required");
  }

  let proof_url;
  if (file) {
    const uploaded = await streamUpload(file.buffer);
    proof_url = uploaded.secure_url;
  }

  console.log(proof_url, "URL");

  const payment = await paymentRepository.createPayment(orderId, {
    amount: remaining,
    type: "FULL",
    method: data.method,
    proofImage: proof_url,
    paidAt: new Date(),
  });

  await serviceOrderRepository.update(orderId, {
    status: "siap diambil",
  });

  return payment;
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
  addPaymentDP,
  addPaymentFinal,
  findAll,
  findById,
  getReceipt,
  update,
  remove,
};
