// src/controller/sparepart.controller.js
import sparepartService from "../service/sparepart.service.js";
import { validate } from "../validation/validate.js";
import {
  createSparepartSchema,
  updateSparepartSchema,
} from "../validation/sparepart.schema.js";

export const create = async (req, res, next) => {
  try {
    const data = validate(createSparepartSchema, req.body);
    const result = await sparepartService.create(data);
    res
      .status(201)
      .json({ message: "Sparepart berhasil ditambahkan", data: result });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await sparepartService.getAll({ page, limit, search });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const result = await sparepartService.getById(req.params.id);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = validate(updateSparepartSchema, req.body);
    const result = await sparepartService.update(req.params.id, data);
    res.json({ message: "Sparepart berhasil diperbarui", data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await sparepartService.remove(req.params.id);
    res.json({ message: "Sparepart berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};
