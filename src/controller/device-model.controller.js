// src/controller/device-model.controller.js
import deviceModelService from "../service/device-model.service.js";
import { validate } from "../validation/validate.js";
import {
  createDeviceModelSchema,
  updateDeviceModelSchema,
} from "../validation/device-model.schema.js";

export const create = async (req, res, next) => {
  try {
    const data = validate(createDeviceModelSchema, req.body);
    const result = await deviceModelService.create(data);
    res
      .status(201)
      .json({ message: "Berhasil menambahkan model perangkat", data: result });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    console.log(req.query);
    const { page, limit, search, brand } = req.query;
    const result = await deviceModelService.getAll({
      page,
      limit,
      search,
      brand,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};
export const getByBrandId = async (req, res, next) => {
  try {
    console.log(req.query);
    const { brand } = req.query;
    const result = await deviceModelService.getByBrandId({
      brand,
    });
    res.json({
      message: "Success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const result = await deviceModelService.getById(req.params.id);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = validate(updateDeviceModelSchema, req.body);
    const result = await deviceModelService.update(req.params.id, data);
    res.json({ message: "Berhasil memperbarui model perangkat", data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deviceModelService.remove(req.params.id);
    res.json({ message: "Model perangkat berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};
