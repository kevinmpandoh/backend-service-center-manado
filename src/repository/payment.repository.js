// src/repository/payment.repository.js
import Payment from "../model/payment.model.js";

const create = (data) => Payment.create(data);

const createPayment = async (orderId, data) => {
  const payment = await Payment.create({ serviceOrder: orderId, ...data });

  // hitung total paid
  // const agg = await Payment.aggregate([
  //   { $match: { serviceOrder: payment.serviceOrder } },
  //   { $group: { _id: "$serviceOrder", total: { $sum: "$amount" } } },
  // ]);

  // const totalPaid = agg[0]?.total || 0;

  // const order = await ServiceOrder.findById(payment.serviceOrder);
  // if (order) {
  //   order.totalPaid = totalPaid;

  //   // update status sesuai pembayaran
  //   if (
  //     order.total_paid >= order.total_cost &&
  //     order.status === "WAITING_PAYMENT"
  //   ) {
  //     order.status = "READY_FOR_PICKUP";
  //   }

  //   await order.save();
  // }

  return payment;
};

const findAll = (filter = {}) => Payment.find(filter).populate("serviceOrder");

const findById = (id) => Payment.findById(id).populate("serviceOrder");

const update = (id, data) => Payment.findByIdAndUpdate(id, data, { new: true });

const remove = (id) => Payment.findByIdAndDelete(id);

export default {
  create,
  createPayment,
  findAll,
  findById,
  update,
  remove,
};
