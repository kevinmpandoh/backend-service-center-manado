// service/user.service.js
import userValidation from "../validation/user.validation.js";
import { validate } from "../validation/validate.js";
import userRepository from "../repository/user.repository.js";
import bcrypt from "bcryptjs";

const getAll = async (params = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    role,
  } = params;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const searchRegex = new RegExp(search, "i");

  const filter = {
    $or: [
      { username: { $regex: searchRegex } },
      { email: { $regex: searchRegex } },
      { name: { $regex: searchRegex } },
    ],
  };

  if (role) {
    filter.role = role;
  }

  const users = await userRepository.findAll(filter, { skip, limit, sort });
  const total = await userRepository.count(filter);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const get = async (username) => {
  const user = await userRepository.findOne({
    username,
  });

  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

const create = async (data) => {
  const validatedData = validate(userValidation.createUserSchema, data);
  const existing = await userRepository.findByUsername({
    username: validatedData.username,
  });

  if (existing) {
    throw new ResponseError(400, "Username sudah digunakan");
  }

  const hashedPassword = await bcrypt.hash(validatedData.password, 10);

  const user = await userRepository.create({
    ...validatedData,
    password: hashedPassword,
  });

  // Jangan kirim password ke response
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

const update = async (id, data) => {
  const validatedData = validate(userValidation.updateUserSchema, data);
  const user = await userRepository.findById(id);
  if (!user) throw new ResponseError(404, "Pengguna tidak ditemukan");

  // Cek duplikasi jika email atau username diubah
  if (validatedData.username) {
    const duplicate = await userRepository.findDuplicate(id, {
      username: validatedData.username || user.username,
    });
    if (duplicate) {
      throw new ResponseError(
        400,
        "Username sudah digunakan oleh pengguna lain"
      );
    }
  }

  const updated = await userRepository.updateById(id, validatedData);
  const { password, ...userWithoutPassword } = updated.toObject();
  return userWithoutPassword;
};

const remove = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw new ResponseError(404, "Pengguna tidak ditemukan");

  await userRepository.deleteById(id);
  return { message: "Pengguna berhasil dihapus" };
};

export default {
  get,
  getAll,
  create,
  update,
  remove,
};
