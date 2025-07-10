// src/controller/customer.controller.js
import customerService from "../service/customer.service.js";
import { validate } from "../validation/validate.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validation/customer.schema.js";

export const create = async (req, res, next) => {
  try {
    const data = validate(createCustomerSchema, req.body);
    const result = await customerService.create(data);
    res
      .status(201)
      .json({ message: "Berhasil menambahkan pelanggan", data: result });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await customerService.getAll({ page, limit, search });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const result = await customerService.getById(req.params.id);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = validate(updateCustomerSchema, req.body);
    const result = await customerService.update(req.params.id, data);
    res.json({ message: "Pelanggan berhasil diperbarui", data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await customerService.remove(req.params.id);
    res.json({ message: "Pelanggan berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};
