import userService from "../service/user.service.js";

const getAll = async (req, res, next) => {
  try {
    const { page, limit, search, sortBy, sortOrder, role } = req.query;
    const result = await userService.getAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || "",
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
      role,
    });
    res.json({
      status: "success",
      message: "Berhasil mengambil data pengguna",
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
const create = async (req, res, next) => {
  try {
    const newUser = await userService.create(req.body);
    res.status(201).json({
      status: "Success",
      message: "Pengguna berhasil dibuat",
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updatedUser = await userService.update(id, req.body);

    res.json({
      status: "Success",
      message: "Pengguna berhasil diperbarui",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await userService.remove(id);

    res.json({
      status: "Success",
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getAll,
  create,
  update,
  deleteUser,
};
