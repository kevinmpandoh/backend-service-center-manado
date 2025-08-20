// src/controller/service-detail.controller.js
import service from "../service/service-detail.service.js";
import { validate } from "../validation/validate.js";
import {
  createServiceDetailSchema,
  updateServiceDetailSchema,
} from "../validation/service-detail.schema.js";

export const create = async (req, res, next) => {
  try {
    const data = validate(createServiceDetailSchema, req.body);
    const result = await service.create(req.params.id, data);
    res
      .status(201)
      .json({ message: "Detail layanan ditambahkan", data: result });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { page, limit, serviceOrder } = req.query;
    const result = await service.getAll({ page, limit, serviceOrder });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const result = await service.getById(req.params.id);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const getByServiceOrderId = async (req, res, next) => {
  try {
    const result = await service.getByServiceOrderId(req.params.serviceOrderId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = validate(updateServiceDetailSchema, req.body);
    const result = await service.update(req.params.id, data);
    res.json({ message: "Detail layanan diperbarui", data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.json({ message: "Detail layanan dihapus" });
  } catch (error) {
    next(error);
  }
};
