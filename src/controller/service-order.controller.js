// src/controller/service-order.controller.js
import serviceOrderService from "../service/service-order.service.js";
import { validate } from "../validation/validate.js";
import {
  createServiceOrderSchema,
  updateServiceOrderSchema,
} from "../validation/service-order.schema.js";

export const create = async (req, res, next) => {
  try {
    const technicianId = req.user._id; // Assuming technician ID is in the request user object
    const payload = validate(createServiceOrderSchema, req.body);
    const result = await serviceOrderService.create(technicianId, payload);
    res
      .status(201)
      .json({ message: "Order service berhasil ditambahkan", data: result });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await serviceOrderService.getAll({ page, limit, status });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const result = await serviceOrderService.getById(req.params.id);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = validate(updateServiceOrderSchema, req.body);
    const result = await serviceOrderService.update(req.params.id, data);
    res.json({ message: "Order service berhasil diperbarui", data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await serviceOrderService.remove(req.params.id);
    res.json({ message: "Order service berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};

export const updateWarranty = async (req, res, next) => {
  try {
    const data = validate(updateServiceOrderSchema, req.body);
    const result = await serviceOrderService.updateWarranty(
      req.params.id,
      data
    );
    res.json({ message: "Garansi berhasil diperbarui", data: result });
  } catch (error) {
    next(error);
  }
};

export const startWork = async (req, res, next) => {
  try {
    const data = await serviceOrderService.startWork(req.params.id);
    res.json({ success: true, message: "Service Sedang diperbaiki", data });
  } catch (err) {
    next(err);
  }
};

export const markAsCompleted = async (req, res, next) => {
  try {
    const data = await serviceOrderService.markAsCompleted(req.params.id);
    res.json({ success: true, message: "Service selesai", data });
  } catch (err) {
    next(err);
  }
};

export const markAsPickedUp = async (req, res, next) => {
  try {
    const data = await serviceOrderService.markAsPickedUp(req.params.id);
    res.json({ success: true, message: "Perangkat telah diambil", data });
  } catch (err) {
    next(err);
  }
};
