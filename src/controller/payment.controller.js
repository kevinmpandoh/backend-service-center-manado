// src/controller/payment.controller.js
import paymentService from "../service/payment.service.js";
import {
  addPaymentDPSchema,
  addPaymentFinalSchema,
  addPaymentSchema,
} from "../validation/payment.validation.js";
import { validate } from "../validation/validate.js";

const create = async (req, res, next) => {
  try {
    const data = validate(addPaymentSchema, req.body);
    const orderId = req.params.orderId;

    const result = await paymentService.create(orderId, data, req.file);
    res
      .status(201)
      .json({ message: "Pembayaran berhasil dibuat", data: result });
  } catch (err) {
    next(err);
  }
};
const addPaymentDP = async (req, res, next) => {
  try {
    const data = validate(addPaymentDPSchema, req.body);
    const orderId = req.params.orderId;

    const result = await paymentService.addPaymentDP(orderId, data, req.file);
    res
      .status(201)
      .json({ message: "Pembayaran DP berhasil dibuat", data: result });
  } catch (err) {
    next(err);
  }
};
const addPaymentFinal = async (req, res, next) => {
  try {
    const data = validate(addPaymentFinalSchema, req.body);
    const orderId = req.params.orderId;

    const result = await paymentService.addPaymentFinal(
      orderId,
      data,
      req.file
    );
    res
      .status(201)
      .json({ message: "Pembayaran Final berhasil dibuat", data: result });
  } catch (err) {
    next(err);
  }
};

const findAll = async (req, res, next) => {
  try {
    const result = await paymentService.findAll();
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

const findById = async (req, res, next) => {
  try {
    const result = await paymentService.findById(req.params.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

const getReceipt = async (req, res, next) => {
  try {
    const result = await paymentService.getReceipt(req.params.id);

    // Tampilkan sebagai JSON (untuk frontend)
    res.json({ data: result });

    // ATAU: jika ingin langsung render HTML
    // res.render("receipt", { payment: result });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.file) {
      data.proofImage = `/uploads/payments/${req.file.filename}`;
    }

    const result = await paymentService.update(req.params.id, data);
    res.json({ message: "Pembayaran berhasil diperbarui", data: result });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await paymentService.remove(req.params.id);
    res.json({ message: "Data pembayaran dihapus", data: result });
  } catch (err) {
    next(err);
  }
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
