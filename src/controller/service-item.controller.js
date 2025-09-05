// src/controller/sparepart.controller.js

import serviceItemService from "../service/service-item.service.js";
import {
  createServiceItemSchema,
  updateServiceItemSchema,
} from "../validation/service-item.schema.js";
import { validate } from "../validation/validate.js";

export const create = async (req, res, next) => {
  try {
    const data = validate(createServiceItemSchema, req.body);
    const result = await serviceItemService.create(data);
    res
      .status(201)
      .json({ message: "Jasa berhasil ditambahkan", data: result });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await serviceItemService.getAll({ page, limit, search });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const result = await serviceItemService.getById(req.params.id);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = validate(updateServiceItemSchema, req.body);
    const result = await serviceItemService.update(req.params.id, data);
    res.json({ message: "Jasa berhasil diperbarui", data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await serviceItemService.remove(req.params.id);
    res.json({ message: "Jasa berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};
