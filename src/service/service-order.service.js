// src/service/service-order.service.js
import paymentRepository from "../repository/payment.repository.js";
import serviceOrderRepository from "../repository/service-order.repository.js";
import { ResponseError } from "../utils/error.js";
import { sendWhatsApp } from "./notification.service.js";
import serviceDetailRepository from "../repository/service-detail.repository.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
dayjs.extend(duration);

const create = async (technicianId, data) => {
  const serviceOrder = await serviceOrderRepository.create({
    customer: data.customer,
    device: data.device,
    technician: technicianId,
    severity: data.severity,
    damage: data.damage,
    customDamageNote: data.customDamageNote,
    status: "diterima",
    estimatedCost: data.estimatedCost,
    estimatedTime: data.estimatedTime,
    notes: data.notes,
    serviceNotes: data.serviceNotes,
    receivedAt: new Date(),
  });

  // Jika ada DP, buat payment langsung
  if (data.downPayment) {
    const payment = await paymentRepository.create({
      serviceOrder: serviceOrder._id,
      method: data.downPayment.method,
      amount: data.downPayment.amount,
      paymentProof:
        data.downPayment.method === "transfer"
          ? data.downPayment.proofUrl
          : null,
      isDownPayment: true,
    });

    await serviceOrderRepository.update(serviceOrder.id, {
      $push: {
        payments: payment._id,
      },
      totalPaid: data.downPayment.amount,
    });
  }

  return serviceOrder;
};

const startWork = async (orderId) => {
  return serviceOrderRepository.update(orderId, {
    status: "diperbaiki",
    startedAt: new Date(),
  });
};

const markAsCompleted = async (id, payload) => {
  const order = await serviceOrderRepository.findById(id).populate({
    path: "device",
  });

  if (!order) throw new ResponseError(404, "Order tidak ditemukan");

  // cek apakah ada minimal 1 jasa service
  const hasService = await serviceDetailRepository.findOne({
    serviceOrder: id,
    type: "jasa",
  });
  if (!hasService) {
    throw new ResponseError(
      400,
      "Minimal 1 jasa perbaikan diperlukan sebelum menyelesaikan order"
    );
  }
  let newStatus = "menunggu pembayaran";
  if (order.totalPaid >= order.totalCost) newStatus = "siap diambil";

  // Hitung endDate garansi
  let endDate = null;
  if (payload.duration) {
    const unit = payload.unit || "day";
    endDate = dayjs().add(payload.duration, unit).toDate();
  }

  const newOrder = await serviceOrderRepository.update(id, {
    status: newStatus,
    completedAt: new Date(),
    warranty: {
      duration: payload.duration,
      unit: payload.unit || "day",
      endDate,
    },
  });

  // Kirim notifikasi otomatis
  const name = order.customer.name;
  const phone = order.customer.phone;
  const msg = `Halo ${name}, service perangkat Anda telah selesai. Silakan datang untuk pengambilan.`;

  await sendWhatsApp(phone, msg);

  return newOrder;
};

const markAsPickedUp = async (id) => {
  const order = await serviceOrderRepository.findById(id).populate({
    path: "device",
    populate: { path: "customer" },
  });

  if (!order) throw new ResponseError(404, "Order tidak ditemukan");

  order.status = "selesai";
  order.pickedUpAt = new Date();
  await order.save();

  // Kirim notifikasi otomatis
  const phone = order.customer.phone;
  const name = order.customer.name;
  const msg = `Terima kasih ${name}, perangkat Anda sudah diambil. Jika ada kendala, silakan hubungi kami`;

  await sendWhatsApp(phone, msg);

  return order;
};

const getAll = async ({ page = 1, limit = 10, search = "", status }) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const pipeline = [];

  // filter by status
  if (status) {
    pipeline.push({ $match: { status } });
  } else {
    // exclude status selesai
    pipeline.push({ $match: { status: { $ne: "selesai" } } });
  }

  // lookup brand
  pipeline.push({
    $lookup: {
      from: "brands",
      localField: "device.brand",
      foreignField: "_id",
      as: "brand",
    },
  });
  pipeline.push({ $unwind: "$brand" });

  // lookup model
  pipeline.push({
    $lookup: {
      from: "devicemodels",
      localField: "device.model",
      foreignField: "_id",
      as: "model",
    },
  });
  pipeline.push({ $unwind: "$model" });

  // lookup damage
  pipeline.push({
    $lookup: {
      from: "damagetypes",
      localField: "damage",
      foreignField: "_id",
      as: "damage",
    },
  });
  pipeline.push({
    $unwind: { path: "$damage", preserveNullAndEmptyArrays: true },
  });

  // lookup serviceDetails
  pipeline.push({
    $lookup: {
      from: "servicedetails",
      localField: "serviceDetails",
      foreignField: "_id",
      as: "serviceDetails",
    },
  });

  // lookup serviceItem
  pipeline.push({
    $lookup: {
      from: "serviceitems",
      localField: "serviceDetails.serviceItem",
      foreignField: "_id",
      as: "serviceItems",
    },
  });

  // lookup sparepart
  pipeline.push({
    $lookup: {
      from: "spareparts",
      localField: "serviceDetails.sparepart",
      foreignField: "_id",
      as: "spareparts",
    },
  });

  pipeline.push({
    $lookup: {
      from: "payments",
      localField: "payments",
      foreignField: "_id",
      as: "payments",
    },
  });

  // search filter
  if (search && search.trim() !== "") {
    const regex = new RegExp(search, "i");
    pipeline.push({
      $match: {
        $or: [
          { "customer.name": regex },
          { "customer.phone": regex },
          { "brand.name": regex },
          { "model.name": regex },
          { "damage.name": regex },
          { customDamageNote: regex },
        ],
      },
    });
  }

  // count total
  const totalPipeline = [...pipeline, { $count: "total" }];
  const totalResult = await serviceOrderRepository.aggregate(totalPipeline);
  const total = totalResult.length > 0 ? totalResult[0].total : 0;

  // pagination
  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // project hasil akhir
  pipeline.push({
    $project: {
      id: "$_id",
      status: 1,
      customerName: "$customer.name",
      customerPhone: "$customer.phone",
      deviceType: "$device.category",
      deviceBrand: "$brand.name",
      deviceModel: "$model.name",
      estimatedCost: 1,
      estimatedTime: 1,
      severity: 1,
      damage: { $ifNull: ["$damage.name", "$customDamageNote"] },
      totalCost: 1,
      totalPaid: 1,
      createdAt: 1,
      serviceDetails: 1,
      serviceItems: 1,
      spareparts: 1,
      payments: 1,
    },
  });

  const data = await serviceOrderRepository.aggregate(pipeline);

  // Format hanya array string untuk jasa & sparepart
  const formattedData = data.map((item) => {
    const jasa = item.serviceDetails.filter((d) => d.type === "jasa");
    const spareparts = item.serviceDetails.filter(
      (d) => d.type === "sparepart"
    );

    // hitung biaya
    const serviceFee = jasa.reduce((acc, j) => acc + j.subtotal, 0);
    const sparepartFee = spareparts.reduce((acc, s) => acc + s.subtotal, 0);

    const services = item.serviceDetails
      .filter((d) => d.type === "jasa")
      .map((d) => {
        const serviceItem = item.serviceItems.find(
          (si) => si._id.toString() === d.serviceItem?.toString()
        );
        // return {
        //   name: serviceItem?.name || d.customServiceName,
        //   subtotal: d.subtotal,
        // };
        return serviceItem?.name || d.customServiceName;
      });

    const totalDownPayment = item.payments
      .filter((p) => p.isDownPayment)
      .reduce((acc, p) => acc + p.amount, 0);

    return {
      ...item,
      services,
      spareparts: item.spareparts.map((sparepart) => sparepart.name),
      serviceFee,
      sparepartFee,
      totalDownPayment,
      // hapus field mentah biar clean
      serviceDetails: undefined,
      serviceItems: undefined,
      payments: undefined,
    };
  });

  return {
    data: formattedData,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getFinishedOrders = async ({ page = 1, limit = 10, search = "" }) => {
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  const skip = (page - 1) * limit;

  const pipeline = [
    {
      $match: { status: "selesai" }, // bisa tambahin "siap_diambil" pakai $in
    },
    {
      $lookup: {
        from: "brands",
        localField: "device.brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    { $unwind: "$brand" },
    {
      $lookup: {
        from: "devicemodels",
        localField: "device.model",
        foreignField: "_id",
        as: "model",
      },
    },
    { $unwind: "$model" },
    {
      $lookup: {
        from: "damagetypes",
        localField: "damage",
        foreignField: "_id",
        as: "damage",
      },
    },
    { $unwind: { path: "$damage", preserveNullAndEmptyArrays: true } },
  ];

  // search filter
  if (search && search.trim() !== "") {
    const regex = new RegExp(search, "i");
    pipeline.push({
      $match: {
        $or: [
          { "customer.name": regex },
          { "customer.phone": regex },
          { "brand.name": regex },
          { "model.name": regex },
          { "damage.name": regex },
        ],
      },
    });
  }

  // count total
  const totalPipeline = [...pipeline, { $count: "total" }];
  const totalResult = await serviceOrderRepository.aggregate(totalPipeline);
  const total = totalResult.length > 0 ? totalResult[0].total : 0;

  // pagination
  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // project data
  pipeline.push({
    $project: {
      _id: 1,
      customerName: "$customer.name",
      customerPhone: "$customer.phone",
      deviceModel: { $concat: ["$brand.name", " ", "$model.name"] },
      damage: "$damage.name",
      totalCost: 1,
      status: 1,
      startedAt: 1,
      completedAt: 1,
    },
  });

  const data = await serviceOrderRepository.aggregate(pipeline);

  // format repairTime pakai dayjs
  const formattedData = data.map((order) => {
    let repairTime = null;
    if (order.startedAt && order.completedAt) {
      const diffMs = dayjs(order.completedAt).diff(dayjs(order.startedAt));
      const durasi = dayjs.duration(diffMs);

      const hours = durasi.hours();
      const minutes = durasi.minutes();

      if (hours > 0) {
        repairTime = `${hours} jam ${minutes} menit`;
      } else {
        repairTime = `${minutes} menit`;
      }
    }

    return {
      ...order,
      repairTime,
    };
  });

  return {
    data: formattedData,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getById = async (id) => {
  const order = await serviceOrderRepository.findById(id);
  if (!order) throw new ResponseError(404, "Service order tidak ditemukan");

  // pisahkan jasa & sparepart
  const jasa = order.serviceDetails.filter((d) => d.type === "jasa");
  const spareparts = order.serviceDetails.filter((d) => d.type === "sparepart");

  // hitung biaya
  const serviceFee = jasa.reduce((acc, j) => acc + j.subtotal, 0);
  const sparepartFee = spareparts.reduce((acc, s) => acc + s.subtotal, 0);

  const baseResult = {
    id: order._id,
    status: order.status,
    damage: order.damage.name,
    estimatedCost: order.estimatedCost,
    estimatedTime: order.estimatedTime,
    device: {
      category: order.device.category,
      brand: order.device.brand.name,
      model: order.device.model.name,
      accessories: order.device.accessories,
    },
    customer: {
      name: order.customer.name,
      phone: order.customer.phone,
    },
    services: jasa.map((j) => ({
      id: j._id,
      serviceItem: j.serviceItem?._id,
      name: j.serviceItem?.name,
      price: j.price,
      customServiceName: j.customServiceName,
      customPrice: j.customPrice,
    })),
    spareparts: spareparts.map((s) => ({
      id: s._id,
      name: s.sparepart?.name,
      sparepart: s.sparepart?._id,
      quantity: s.quantity,
      price: s.price,
      subtotal: s.subtotal,
    })),
  };

  // hanya tampilkan payment jika ada
  if (order.payments && order.payments.length > 0) {
    const totalDownPayment = order.payments
      .filter((p) => p.isDownPayment)
      .reduce((acc, p) => acc + p.amount, 0);

    const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0);
    const remaining = order.totalCost > 0 ? order.totalCost - totalPaid : 0;

    baseResult.payment = {
      serviceFee,
      sparepartFee,
      totalCost: order.totalCost,
      totalDownPayment,
      totalPaid,
      remaining,
      proofs: order.payments
        .filter((p) => !!p.paymentProof)
        .map((p) => p.paymentProof),
    };
  }

  return baseResult;
};

const update = async (id, data) => {
  if (data.warrantyDuration && data.completedAt) {
    const completed = new Date(data.completedAt);
    data.warrantyExpiredAt = new Date(
      completed.getTime() + data.warrantyDuration * 24 * 60 * 60 * 1000
    );
  }
  const result = await serviceOrderRepository.update(id, data);
  if (!result) throw new ResponseError(404, "Service order tidak ditemukan");
  return result;
};

const remove = async (id) => {
  const result = await serviceOrderRepository.remove(id);
  if (!result) throw new ResponseError(404, "Service order tidak ditemukan");
  return result;
};

const updateWarranty = async (id, data) => {
  const result = await serviceOrderRepository.update(id, {
    warranty: data,
  });
  if (!result) throw new ResponseError(404, "Service order tidak ditemukan");
  return result;
};

const exportFinishedOrders = async (query) => {
  const { data } = await getFinishedOrders(query);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Finished Orders");

  worksheet.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Pelanggan", key: "customer", width: 25 },
    { header: "Perangkat", key: "device", width: 20 },
    { header: "Kerusakan", key: "damage", width: 25 },
    { header: "Waktu Perbaikan", key: "repairTime", width: 20 },
    { header: "Biaya", key: "cost", width: 15 },
    { header: "Status", key: "status", width: 15 },
  ];

  data.forEach((o, idx) => {
    worksheet.addRow({
      no: idx + 1,
      customer: `${o.customer?.name} (${o.customer?.phone})`,
      device: o.device,
      damage: o.damage,
      repairTime: o.repairTime,
      cost: o.cost,
      status: o.status,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

const generateInvoice = async (orderId) => {
  const order = await serviceOrderRepository.findById(orderId);
  if (!order) throw new Error("Service order tidak ditemukan");

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));

  // ========== HEADER ==========
  const logoPath = path.resolve("public/logo.jpg");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 30, { width: 60 });
  }

  doc
    .fontSize(16)
    .text("PUSAT SERVICE", 120, 35, { continued: true })
    .fontSize(14)
    .text(" HANDPHONE - LAPTOP");
  doc
    .fontSize(9)
    .text("Ruko Kawasan Megamas, JL. Pierre Tendean Blok 1A1 no 26", 120, 55);
  doc.text("Telp/WA: 0811-4377-700", 120, 70);

  // ===== SOSIAL MEDIA =====
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("IG: @namatoko   |   FB: fb.com/namatoko", 200, 95);

  doc
    .fontSize(14)
    .text("NOTA SERVICE", 450, 40, { align: "right" })
    .fontSize(10)
    .text(`No Nota : ${order._id}`, 450, 60, { align: "right" });

  doc.moveDown(4);

  // ========== CUSTOMER INFO ==========
  const col1 = 40; // kolom keterangan kiri
  const col2 = 120; // kolom value kiri
  const col3 = 300; // kolom keterangan kanan
  const col4 = 420; // kolom value kanan
  let infoY = 120; // posisi awal

  doc.fontSize(11);

  // Baris 1 → Tanggal & Nama Konsumen
  doc.text("Tanggal", col1, infoY);
  doc.text(
    `: ${new Date(order.createdAt).toLocaleDateString("id-ID")}`,
    col2,
    infoY
  );

  doc.text("Nama Konsumen", col3, infoY);
  doc.text(`: ${order.customer?.name || "-"}`, col4, infoY);

  // Baris 2 → Teknisi & No WA
  infoY += 15;
  doc.text("Teknisi", col1, infoY);
  doc.text(`: ${order.technician?.name || "-"}`, col2, infoY);

  doc.text("No WA Konsumen", col3, infoY);
  doc.text(`: ${order.customer?.phone || "-"}`, col4, infoY);

  // Baris 3 → Merek/Tipe HP (full row)
  infoY += 20;
  doc.text(
    `Merek/Tipe Unit : ${order.device?.brand.name} ${order.device?.model.name}`,
    col1,
    infoY,
    { continued: false }
  );

  doc.moveDown(2);

  // ========== KERUSAKAN ==========
  doc.fontSize(11).text("KERUSAKAN", { underline: true });
  const checkItems = [
    "Software",
    "Hardware",
    "Mati Total",
    "Masuk Air",
    "IC Charge",
    "IC Gambar",
    "Ganti Baterai",
    "Ganti LCD",
    "Buka Pola/PIN/Passw",
    "Mic/Audio",
    "Speaker",
    "Fuse Baterai",
    "Connector Charge",
    "No Charging",
    "Flexi On/Off/Volume",
    "Flexi Mic/Board",
    "Error/Hang",
    "Lainnya",
  ];

  let startY = doc.y + 5;
  const colWidth = 180;
  checkItems.forEach((item, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 40 + col * colWidth;
    const y = startY + row * 20;

    doc.rect(x, y, 10, 10).stroke();

    let checked = order.serviceDetails.some(
      (d) =>
        d.type === "jasa" &&
        d.service_item?.name?.toLowerCase().includes(item.toLowerCase())
    );
    if (checked) {
      doc
        .moveTo(x, y)
        .lineTo(x + 10, y + 10)
        .stroke();
      doc
        .moveTo(x + 10, y)
        .lineTo(x, y + 10)
        .stroke();
    }
    doc.text(item, x + 15, y - 2);
  });

  doc.moveDown(20);

  // ========== BIAYA ==========
  const biayaX = 350;
  let biayaY = 350;

  doc
    .fontSize(11)
    .text(
      `Biaya Total : Rp ${order.totalCost.toLocaleString("id-ID")}`,
      biayaX,
      biayaY
    );
  biayaY += 15;
  doc.text(
    `Dibayar     : Rp ${order.totalPaid.toLocaleString("id-ID")}`,
    biayaX,
    biayaY
  );
  biayaY += 15;
  doc.text(
    `Sisa        : Rp ${(order.totalCost - order.totalPaid).toLocaleString(
      "id-ID"
    )}`,
    biayaX,
    biayaY
  );

  // ===== Bagian GARANSI (kiri) =====
  let garansiY = 350;
  doc
    .font("Helvetica-Bold")
    .text("GARANSI:", 40, garansiY, { underline: true });
  garansiY += 20;

  const garansiOptions = [
    "7 HARI",
    "14 HARI",
    "30 HARI",
    "90 HARI",
    "NON GARANSI",
  ];
  garansiOptions.forEach((opt, i) => {
    const col = i % 2 === 0 ? 40 : 200; // bikin 2 kolom
    const row = Math.floor(i / 2);
    doc.rect(col, garansiY + row * 20, 10, 10).stroke();
    doc.text(opt, col + 15, garansiY + row * 20);
  });

  // ========== KELENGKAPAN ==========
  let kelengkapanY = garansiY + 80;
  doc
    .font("Helvetica-Bold")
    .text("KELENGKAPAN:", 40, kelengkapanY, { underline: true });
  kelengkapanY += 20;

  const items = ["SIM CARD", "BATERAI", "CASING/CASE", "MMC"];
  items.forEach((item, i) => {
    const col = i % 2 === 0 ? 40 : 200; // 2 kolom juga
    const row = Math.floor(i / 2);
    doc.rect(col, kelengkapanY + row * 20, 10, 10).stroke();
    doc.text(item, col + 15, kelengkapanY + row * 20);
  });
  doc.moveDown(4);

  // ========== SYARAT & KETENTUAN ==========
  // ===== SYARAT & KETENTUAN =====
  let termsY = 550; // sesuaikan posisi terakhir layout
  doc.font("Helvetica-Bold").text("SYARAT & KETENTUAN:", 40, termsY);
  termsY += 20;

  const terms = [
    "Barang yang tidak diambil dalam 30 hari bukan tanggung jawab kami.",
    "Klaim garansi wajib membawa nota ini.",
    "Garansi tidak berlaku bila segel rusak / hp terkena cairan.",
    "Data pribadi bukan tanggung jawab kami jika hilang.",
  ];

  doc.font("Helvetica").fontSize(10);
  terms.forEach((term, i) => {
    doc.text(`${i + 1}. ${term}`, 50, termsY);
    termsY += 15;
  });

  // ===== FOOTER (TTD) =====
  let footerY = termsY + 30;
  doc.font("Helvetica").fontSize(11);
  doc.text("Hormat Kami,", 60, footerY);
  doc.text("Konsumen,", 350, footerY);

  footerY += 60;
  doc.text("(_________________)", 50, footerY);
  doc.text("(_________________)", 340, footerY);

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
  });
};

export default {
  create,
  markAsPickedUp,
  markAsCompleted,
  getAll,
  getFinishedOrders,
  exportFinishedOrders,
  generateInvoice,
  getById,
  update,
  remove,
  updateWarranty,
  startWork,
};
