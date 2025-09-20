// src/service/device-model.service.js
import deviceModelRepository from "../repository/device-model.repository.js";
import brandRepository from "../repository/brand.repository.js";
import { ResponseError } from "../utils/error.js";
import deviceModelModel from "../model/device-model.model.js";

const create = async (data) => {
  let brand;

  if (data.brandId) {
    brand = await brandRepository.findById(data.brandId);
    if (!brand) throw new ResponseError(404, "Brand tidak ditemukan");
  } // jika manual brandName ada → cek dulu apakah sudah ada brand
  else if (data.brandName) {
    brand = await brandRepository.findByNameAndType(data.brandName, data.type);
    if (!brand) {
      brand = await brandRepository.create({
        name: data.brandName,
        type: data.type,
      });
    }
  } else {
    throw new ResponseError(400, "Harus pilih brand atau isi manual brand");
  }

  return deviceModelRepository.create({
    name: data.name,
    brand: brand._id,
  });
  // const brand = await brandRepository.findById(data.brand);
  // if (!brand) throw new ResponseError(404, "Brand tidak ditemukan");

  // return deviceModelRepository.create(data);
};

const getAll = async ({ page = 1, limit = 10, search = "" }) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const regex = new RegExp(search, "i");

  const query = search
    ? {
        $or: [
          { name: regex }, // deviceModel name
          { "brand.name": regex }, // brand name
          { "brand.type": regex }, // brand type
        ],
      }
    : {};

  const [totalResult, data] = await Promise.all([
    deviceModelRepository.count(query),
    deviceModelRepository.find(query, skip, limit),
  ]);

  const total = totalResult[0]?.total || 0;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getById = async (id) => {
  const deviceModel = await deviceModelRepository.findById(id);
  if (!deviceModel)
    throw new ResponseError(404, "Device model tidak ditemukan");
  return deviceModel;
};

const update = async (id, data) => {
  let brand;

  if (data.brandId) {
    brand = await brandRepository.findById(data.brandId);
    if (!brand) throw new ResponseError(404, "Brand tidak ditemukan");
  } else if (data.brandName) {
    brand = await brandRepository.findByNameAndType(data.brandName, data.type);
    if (!brand) {
      brand = await brandRepository.create({
        name: data.brandName,
        type: data.type,
      });
    }
  }

  const updateData = { ...data };
  if (brand) updateData.brand = brand._id;
  delete updateData.brandId;
  delete updateData.brandName;

  return deviceModelRepository.update(id, updateData);
  // if (data.brand) {
  //   const brand = await brandRepository.findById(data.brand);
  //   if (!brand) throw new ResponseError(404, "Brand tidak ditemukan");
  // }

  // const updated = await deviceModelRepository.update(id, data);
  // if (!updated) throw new ResponseError(404, "Device model tidak ditemukan");
  // return updated;
};

const remove = async (id) => {
  const deleted = await deviceModelRepository.remove(id);
  if (!deleted) throw new ResponseError(404, "Device model tidak ditemukan");
  return deleted;
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
