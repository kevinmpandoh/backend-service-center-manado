import User from "../model/user.model.js";

const findAll = async (filter, options = {}) => {
  const { skip = 0, limit = 10, sort = {} } = options;

  const users = await User.find(filter)
    .select("-password")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return users;
};

const findById = async (id) => {
  return User.findById(id);
};

const findOne = async (filter) => {
  return User.findOne(filter);
};

const findByUsername = async ({ username }) => {
  return User.findOne({
    username,
  });
};

const count = async (filter) => {
  return User.countDocuments(filter);
};

const findDuplicate = async (id, { username }) => {
  return User.findOne({
    _id: { $ne: id },
    $or: [{ username }],
  });
};

const create = async (data) => {
  return User.create(data);
};

const updateById = async (id, data) => {
  return User.findByIdAndUpdate(id, data, { new: true });
};

const deleteById = async (id) => {
  return User.findByIdAndDelete(id);
};

export default {
  findAll,
  findByUsername,
  findOne,
  findById,
  findDuplicate,
  count,
  create,
  updateById,
  deleteById,
};
