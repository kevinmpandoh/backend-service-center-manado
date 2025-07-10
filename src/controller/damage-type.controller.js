// src/controller/damage-type.controller.js
import damageTypeService from "../service/damage-type.service.js";
import { validate } from "../validation/validate.js";
import {
  createDamageTypeSchema,
  updateDamageTypeSchema,
} from "../validation/damage-type.schema.js";

export const create = async (req, res, next) => {
  try {
    const data = validate(createDamageTypeSchema, req.body);
    const result = await damageTypeService.create(data);
    res
      .status(201)
      .json({ message: "Berhasil menambahkan jenis kerusakan", data: result });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { page, limit, search, applicableTo } = req.query;
    const result = await damageTypeService.getAll({
      page,
      limit,
      search,
      applicableTo,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const result = await damageTypeService.getById(req.params.id);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = validate(updateDamageTypeSchema, req.body);
    const result = await damageTypeService.update(req.params.id, data);
    res.json({ message: "Berhasil memperbarui jenis kerusakan", data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await damageTypeService.remove(req.params.id);
    res.json({ message: "Jenis kerusakan berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};
