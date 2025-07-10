// src/repository/payment.repository.js
import Payment from "../model/payment.model.js";

const create = (data) => Payment.create(data);

const findAll = (filter = {}) => Payment.find(filter).populate("serviceOrder");

const findById = (id) => Payment.findById(id).populate("serviceOrder");

const update = (id, data) => Payment.findByIdAndUpdate(id, data, { new: true });

const remove = (id) => Payment.findByIdAndDelete(id);

export default {
  create,
  findAll,
  findById,
  update,
  remove,
};
