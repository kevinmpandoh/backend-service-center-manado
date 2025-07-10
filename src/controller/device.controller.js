// src/controller/device.controller.js
import deviceService from "../service/device.service.js";
import { validate } from "../validation/validate.js";
import {
  createDeviceSchema,
  updateDeviceSchema,
} from "../validation/device.schema.js";

export const create = async (req, res, next) => {
  try {
    const data = validate(createDeviceSchema, req.body);
    const result = await deviceService.create(data);
    res
      .status(201)
      .json({ message: "Perangkat berhasil ditambahkan", data: result });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { page, limit, search, customer, type } = req.query;
    const result = await deviceService.getAll({
      page,
      limit,
      search,
      customer,
      type,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const result = await deviceService.getById(req.params.id);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = validate(updateDeviceSchema, req.body);
    const result = await deviceService.update(req.params.id, data);
    res.json({ message: "Perangkat berhasil diperbarui", data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deviceService.remove(req.params.id);
    res.json({ message: "Perangkat berhasil dihapus (soft delete)" });
  } catch (error) {
    next(error);
  }
};
