// src/controller/service-order.controller.js
import serviceOrderService from "../service/service-order.service.js";
import { validate } from "../validation/validate.js";
import {
  createServiceOrderSchema,
  updateServiceOrderSchema,
} from "../validation/service-order.schema.js";

export const create = async (req, res, next) => {
  try {
    const data = validate(createServiceOrderSchema, req.body);
    const result = await serviceOrderService.create(data);
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
