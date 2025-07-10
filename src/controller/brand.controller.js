// src/controller/brand.controller.js
import brandService from "../service/brand.service.js";
import { validate } from "../validation/validate.js";
import {
  createBrandSchema,
  updateBrandSchema,
} from "../validation/brand.validation.js";

export const create = async (req, res, next) => {
  try {
    const data = validate(createBrandSchema, req.body);
    const result = await brandService.create(data);
    res.status(201).json({
      status: "Success",
      message: "Berhasil menambahkan brand",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { page, limit, search, type } = req.query;
    const result = await brandService.getAll({ page, limit, search, type });
    res.json({
      status: "Success",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const result = await brandService.getById(req.params.id);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = validate(updateBrandSchema, req.body);
    const result = await brandService.update(req.params.id, data);
    res.json({ message: "Berhasil memperbarui brand", data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await brandService.remove(req.params.id);
    res.json({ message: "Brand berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};
