// src/service/payment.service.js
import { ResponseError } from "../utils/error.js";
import paymentRepository from "../repository/payment.repository.js";
import serviceOrderRepository from "../repository/service-order.repository.js";
import { streamUpload } from "../config/cloudinary.js";

const create = async (orderId, data, file) => {
  const serviceOrder = await serviceOrderRepository.findById(data.serviceOrder);
  if (!serviceOrder) {
    throw new ResponseError(404, "Service order tidak ditemukan");
  }

  // Jika metode transfer, bukti wajib
  if (data.method === "transfer") {
    if (!file) throw new ResponseError(400, "Bukti transfer wajib diunggah");
    // upload ke Cloudinary
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "payments" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(fileBuffer);
      });
    };

    const uploaded = await streamUpload(file.buffer);
    data.proof_url = uploaded.secure_url;
  }

  if (data.method === "CASH") {
    // abaikan proof_url meskipun dikirim
    delete data.proof_url;
  }

  return paymentRepository.createPayment(orderId, data);
  // }
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
    status: "siap_diambil",
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
