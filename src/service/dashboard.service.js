import serviceOrderRepository from "../repository/service-order.repository.js";
import serviceDetailRepository from "../repository/service-detail.repository.js";
import sparepartRepository from "../repository/sparepart.repository.js";
import serviceOrderModel from "../model/service-order.model.js";
import serviceDetailModel from "../model/service-detail.model.js";
import paymentModel from "../model/payment.model.js";
import dayjs from "dayjs";
import sparepartService from "./sparepart.service.js";

const getTechnicianDashboard = async (technicianId) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const summary = {
    totalMonth: await serviceOrderRepository.count({
      createdAt: { $gte: startOfMonth },
    }),
    totalToday: await serviceOrderRepository.count({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }),
    inProgress: await serviceOrderRepository.count({
      status: "diperbaiki",
      technician: technicianId,
    }),
    finishedToday: await serviceOrderRepository.count({
      status: "selesai",
      updatedAt: { $gte: startOfDay, $lte: endOfDay },
      technician: technicianId,
    }),
  };

  const devices = await serviceOrderModel.aggregate([
    // Join ke Brand
    {
      $lookup: {
        from: "brands",
        localField: "device.brand",
        foreignField: "_id",
        as: "brandData",
      },
    },
    { $unwind: "$brandData" },

    // Join ke DeviceModel
    {
      $lookup: {
        from: "devicemodels",
        localField: "device.model",
        foreignField: "_id",
        as: "modelData",
      },
    },
    { $unwind: "$modelData" },

    // Group berdasarkan brand + model
    {
      $group: {
        _id: {
          brand: "$brandData.name", // pastikan di Brand ada field `name`
          model: "$modelData.name", // pastikan di DeviceModel ada field `name`
        },
        total: { $sum: 1 },
      },
    },

    // Bentuk output name dan total
    {
      $project: {
        _id: 0,
        name: { $concat: ["$_id.brand", " ", "$_id.model"] },
        total: 1,
      },
    },

    // Urutkan dan limit top 5
    { $sort: { total: -1 } },
    { $limit: 5 },
  ]);

  const tasks = await serviceOrderRepository
    .find({
      technician: technicianId,
      status: {
        $in: ["diterima", "diperbaiki", "menunggu pembayaran", "siap diambil"],
      },
    })
    .populate("device.model")
    .populate("device.brand")
    .populate("damage", "name status")
    .populate("customer");

  const taskList = tasks.map((t) => ({
    id: t._id,
    customer: t.customer.name,
    device: `${t.device.brand.name} ${t.device.model.name}`,
    damage: t.damage?.name || "",
    status: t.status,
  }));

  const historyRaw = await serviceDetailRepository
    .find({ status: "selesai" })
    .populate([
      {
        path: "serviceOrder",
        populate: [
          {
            path: "customer",
          },
          {
            path: "device.brand",
          },
          {
            path: "device.model",
          },
          {
            path: "damage",
          },
        ],
      },
    ]);

  const history = historyRaw.map((h, idx) => ({
    id: h._id,
    no: idx + 1,
    customer: h.serviceOrder.customer.name,
    phone: h.serviceOrder.customer.phone,
    device: `${h.serviceOrder.device.brand.name} ${h.serviceOrder.device.model.name}`,
    damage: h.serviceOrder.damage?.name || "-",
    // damage: h.type === "sparepart" ? h.sparepartName : h.serviceName,
    // time: `${Math.floor(h.serviceOrder.estimatedTime / 60)} Jam ${
    //   h.serviceOrder.estimatedTime % 60
    // } Menit`,
    time: h.serviceOrder.estimatedTime,
    cost: h.price,
  }));

  return {
    summary,
    devices,
    tasks: taskList.slice(0, 3),
    history,
  };
};

const getSparepartDashboard = async () => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const summary = {
    totalSoldMonth: await serviceDetailRepository.count({
      createdAt: { $gte: startOfMonth },
      type: "sparepart",
    }),
    totalSoldToday: await serviceDetailRepository.count({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      type: "sparepart",
    }),
    lowStock: await sparepartRepository.count({ stock: { $lte: 5 } }),
    finishedToday: await serviceOrderRepository.count({
      status: "finished",
      updatedAt: { $gte: startOfDay, $lte: endOfDay },
    }),
  };

  const mostUsedAgg = await serviceDetailModel.aggregate([
    {
      $lookup: {
        from: "spareparts",
        localField: "sparepart",
        foreignField: "_id",
        as: "sparepart",
      },
    },
    { $unwind: "$sparepart" },
    { $match: { type: "sparepart" } },
    { $group: { _id: "$sparepart.name", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 5 },
  ]);

  const mostUsed = mostUsedAgg.map((s) => ({ name: s._id, total: s.total }));

  const lowStockList = await sparepartRepository.find({ stock: { $lte: 3 } });

  const history = await sparepartService.getUsedSpareparts({
    page: 1,
    limit: 5,
  });

  return { summary, mostUsed, lowStock: lowStockList, history: history.data };
};

const getAdminDashboard = async () => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // 📊 Summary
  const summary = {
    totalRepairsToday: await serviceOrderRepository.count({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }),
    totalIncomeToday: await paymentModel
      .aggregate([
        { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .then((res) => res[0]?.total || 0),
    totalSparepartUsed: await serviceDetailRepository.count({
      type: "sparepart",
    }),
    totalRepairInProgress: await serviceOrderRepository.count({
      status: "in_progress",
    }),
  };

  // 💰 Income per month (chart)
  const monthlyIncomeAgg = await paymentModel.aggregate([
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // nama bulan (bisa bahasa Indonesia juga kalau mau)
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const year = 2025;

  // Buat list bulan 1–12 dengan default total = 0
  const fullYear = Array.from({ length: 12 }, (_, i) => ({
    month: `${monthNames[i]} ${year}`,
    total: 0,
  }));

  // Merge dengan hasil aggregate
  monthlyIncomeAgg.forEach((m) => {
    const index = m._id.month - 1; // karena array mulai dari 0
    if (m._id.year === year) {
      fullYear[index].total = m.total;
    }
  });

  // const monthlyIncome = monthlyIncomeAgg.map((m) => ({
  //   month: `${monthNames[m._id.month - 1]} ${m._id.year}`, // contoh: "Sep 2025"
  //   total: m.total,
  // }));

  // 📱 Top repaired devices

  const topDevices = await serviceOrderModel.aggregate([
    // Join ke Brand
    {
      $lookup: {
        from: "brands",
        localField: "device.brand",
        foreignField: "_id",
        as: "brandData",
      },
    },
    { $unwind: "$brandData" },

    // Join ke DeviceModel
    {
      $lookup: {
        from: "devicemodels",
        localField: "device.model",
        foreignField: "_id",
        as: "modelData",
      },
    },
    { $unwind: "$modelData" },

    // Group berdasarkan brand + model
    {
      $group: {
        _id: {
          brand: "$brandData.name", // pastikan di Brand ada field `name`
          model: "$modelData.name", // pastikan di DeviceModel ada field `name`
        },
        total: { $sum: 1 },
      },
    },

    // Bentuk output name dan total
    {
      $project: {
        _id: 0,
        name: { $concat: ["$_id.brand", " ", "$_id.model"] },
        total: 1,
      },
    },

    // Urutkan dan limit top 5
    { $sort: { total: -1 } },
    { $limit: 5 },
  ]);

  // 🕑 Latest repairs
  const recentOrders = await serviceOrderRepository
    .find()
    .sort({ createdAt: -1 })
    .limit(5)

    .populate("device.brand")
    .populate("device.model")
    .populate("damage")
    .populate("technician");

  const history = recentOrders.map((o, idx) => ({
    no: idx + 1,
    customer: o.customer.name,
    phone: o.customer.phone,
    device: `${o.device.brand.name} ${o.device.model.name}`,
    technician: o.technician?.name || "-",
    damage: o.damage.name,
    status: o.status,
    time: o.estimatedTime,
    total: o.totalPaid,
  }));

  return { summary, monthlyIncome: fullYear, topDevices, history };
};

export default {
  getTechnicianDashboard,
  getSparepartDashboard,
  getAdminDashboard,
};
