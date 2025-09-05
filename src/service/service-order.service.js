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
import damageTypeRepository from "../repository/damage-type.repository.js";
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

const getFinishedOrders = async ({
  page = 1,
  limit = 10,
  search = "",
  startDate,
  endDate,
}) => {
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  const skip = (page - 1) * limit;

  const pipeline = [
    {
      $match: {
        status: "selesai",
        ...(startDate && endDate
          ? {
              completedAt: {
                $gte: dayjs(startDate).startOf("day").toDate(),
                $lte: dayjs(endDate).endOf("day").toDate(),
              },
            }
          : {}),
      }, // bisa tambahin "siap_diambil" pakai $in
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
  const { format = "excel" } = query;

  if (format === "excel") {
    // --- Excel export ---
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
        customer: `${o.customerName} (${o.customerPhone})`,
        device: o.deviceModel,
        damage: o.damage,
        repairTime: o.repairTime,
        cost: o.totalCost,
        status: o.status,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer, format: "xlsx" };
  } else if (format === "pdf") {
    // --- PDF export ---
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    const endPromise = new Promise((resolve) =>
      doc.on("end", () => resolve(Buffer.concat(chunks)))
    );

    // Judul
    doc.fontSize(16).text("Laporan Service Orders - Finished", {
      align: "center",
    });
    doc.moveDown(1.5);

    // definisi kolom
    const tableTop = 100;
    const colWidths = [30, 120, 100, 100, 90, 70, 60]; // total < A4 width
    const colX = [];
    let x = doc.page.margins.left;
    colWidths.forEach((w) => {
      colX.push(x);
      x += w;
    });

    // header
    const headers = [
      "No",
      "Pelanggan",
      "Perangkat",
      "Kerusakan",
      "Waktu",
      "Biaya",
      "Status",
    ];
    doc.fontSize(10).font("Helvetica-Bold");
    headers.forEach((h, i) => {
      doc.text(h, colX[i], tableTop, { width: colWidths[i], align: "left" });
    });

    // garis bawah header
    doc
      .moveTo(colX[0], tableTop + 15)
      .lineTo(
        colX[colX.length - 1] + colWidths[colWidths.length - 1],
        tableTop + 15
      )
      .stroke();

    // isi tabel
    doc.font("Helvetica").fontSize(9);
    let y = tableTop + 20;

    data.forEach((o, idx) => {
      const row = [
        String(idx + 1),
        `${o.customerName} (${o.customerPhone})`,
        o.deviceModel || "-",
        o.damage || "-",
        o.repairTime || "-",
        String(o.totalCost || 0),
        o.status || "-",
      ];

      row.forEach((text, i) => {
        doc.text(text, colX[i], y, { width: colWidths[i], align: "left" });
      });

      y += 20;

      // kalau udah mau habis halaman
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = tableTop;
      }
    });

    doc.end();
    const buffer = await endPromise;
    return { buffer, format: "pdf" };
  }
};

const generateInvoice = async (orderId) => {
  const order = await serviceOrderRepository.findById(orderId);
  if (!order) throw new ResponseError(404, "Service order tidak ditemukan");

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));

  // ========== HEADER ==========
  const logoPath = path.resolve("public/logo.jpg");
  const location = path.resolve("public/icons/location.png");
  const phone = path.resolve("public/icons/phone.png");
  const facebook = path.resolve("public/icons/facebook.png");
  const instagram = path.resolve("public/icons/instagram.png");
  const whatsapp = path.resolve("public/icons/whatsapp.png");

  const iconSize = 10;
  let headerY = 55;

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 30, { width: 60 });

    doc.save();

    // Set transparansi (supaya jadi watermark)
    doc.opacity(0.1);

    // Tempatkan logo di tengah halaman dengan ukuran besar
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const logoWidth = pageWidth * 0.9; // 90% dari lebar halaman
    doc.image(logoPath, (pageWidth - logoWidth) / 2, pageHeight / 6, {
      width: logoWidth,
    });

    // Balikin opacity & grafik state
    doc.opacity(1);
    doc.restore();
  }

  doc
    .fontSize(16)
    .text("PUSAT SERVICE", 120, 35, { continued: true })
    .fontSize(16)
    .text(" HANDPHONE - LAPTOP");

  doc.image(location, 120, headerY, {
    width: iconSize,
  });
  doc
    .fontSize(9)
    .text(
      "Ruko Kawasan Megamas, JL. Pierre Tendean Blok 1A1 no 26",
      135,
      headerY
    );

  // ====== TELEPON ======
  headerY += 15;
  doc.image(phone, 120, headerY, {
    width: iconSize,
  });
  doc.fontSize(9).text("0811-4377-700", 135, headerY);

  // ===== SOSIAL MEDIA =====
  // ====== IG ======
  headerY += 20;
  doc.image(instagram, 120, headerY, {
    width: iconSize,
  });
  doc.fontSize(10).text("@namatoko", 135, headerY);

  // ====== FB ======
  doc.image(facebook, 220, headerY, {
    width: iconSize,
  });
  doc.fontSize(10).text("fb.com/namatoko", 235, headerY);

  // WA
  doc.image(whatsapp, 320, headerY, {
    width: iconSize,
  });
  doc.fontSize(10).text("0895128371823", 335, headerY);

  doc
    .fontSize(14)
    .text("NOTA SERVICE", 450, 35, { align: "right" })
    .fontSize(10)
    .text(`No Nota : ${order._id}`, 450, 55, { align: "right" });

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
  doc.fontSize(16).text("KERUSAKAN", { underline: true });

  let damageList = await damageTypeRepository.find({}, {}, 20);

  damageList = damageList.sort((a, b) => {
    if (a.name.toLowerCase() === "lainnya") return 1;
    if (b.name.toLowerCase() === "lainnya") return -1;
    return 0;
  });

  const orderDamages = Array.isArray(order.damage)
    ? order.damage.map((d) => d.name.toLowerCase())
    : order.damage?.name
    ? [order.damage.name.toLowerCase()]
    : [];

  let startY = doc.y + 5;
  const colWidth = 180;

  const hasMatch = damageList.some(
    (damage) =>
      damage.name.toLowerCase() !== "lainnya" &&
      orderDamages.includes(damage.name.toLowerCase())
  );

  damageList.forEach((damage, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 40 + col * colWidth;
    const y = startY + row * 20;

    doc.rect(x, y, 10, 10).stroke();

    let checked = false;

    if (damage.name.toLowerCase() === "lainnya") {
      // hanya centang "lainnya" kalau memang tidak ada match sama sekali
      checked = !hasMatch;
    } else {
      // centang normal kalau ada di order
      checked = orderDamages.includes(damage.name.toLowerCase());
    }

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

    doc.fontSize(12).text(damage.name, x + 15, y - 2);
  });
  doc.moveDown(20);

  // ========== BIAYA DAN SYARAT ==========
  doc.fontSize(12).text("BIAYA :", 40, 350);

  let biayaStartY = 350 + 20;

  // Kotak syarat & ketentuan
  const boxX = 40;
  const boxY = biayaStartY;
  const boxWidth = 250;
  const boxHeight = 200;

  doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();
  doc
    .fontSize(10)
    .fillColor("red")
    .text("Syarat dan Ketentuan :", boxX + 5, boxY + 5);

  const terms = [
    "Kami tidak bertanggung jawab atas kehilangan kontak/nomor telepon dan data yang tersimpan di dalam handphone.",
    "Pastikan tidak meninggalkan SIM CARD & MEMORI CARD anda.",
    "Penggantian LCD dan Software TIDAK BERGARANSI (kecuali ada kesepakatan).",
    "Garansi berlaku rusak kerusakan yang sama, non garansi part basah atau terbakar.",
    "Garansi LCD dan BATERAI tidak termasuk cacat fisik (pecah/retak/basah/air/bengkak).",
    "Jika dalam satu bulan unit tidak diambil maka bukan lagi menjadi tanggung jawab kami.",
  ];

  let termY = boxY + 20;
  terms.forEach((t, i) => {
    doc.fontSize(10).text(`${i + 1}. ${t}`, boxX + 5, termY, {
      width: boxWidth - 10,
      align: "justify",
    });

    termY = doc.y + 3;
  });

  // ========== GARANSI & KELENGKAPAN ==========
  const rightColX = 320;
  let rightY = biayaStartY;
  const rightSectionWidth = 200;

  // GARANSI
  doc.fontSize(12).fillColor("black").text("GARANSI", rightColX, rightY, {
    width: rightSectionWidth,
    align: "center",
  });
  rightY += 25;

  const garansiOptions = [
    "7 HARI",
    "14 HARI",
    "30 HARI",
    "90 HARI",
    "NON GARANSI",
  ];
  garansiOptions.forEach((opt, idx) => {
    const x = rightColX + (idx % 2) * 130;
    const y = rightY + Math.floor(idx / 2) * 25;

    doc.rect(x, y, 10, 10).stroke();
    doc.fontSize(12).text(opt, x + 15, y - 2);
  });

  rightY += 80;

  // KELENGKAPAN
  doc.fontSize(12).text("KELENGKAPAN", rightColX, rightY, {
    width: rightSectionWidth,
    align: "center",
  });
  rightY += 25;

  const kelengkapanOptions = ["SIM CARD", "BATERAI", "CASING/CASE", "MMC"];
  kelengkapanOptions.forEach((opt, idx) => {
    const x = rightColX + (idx % 2) * 130;
    const y = rightY + Math.floor(idx / 2) * 25;

    doc.rect(x, y, 10, 10).stroke();
    doc.fontSize(12).text(opt, x + 15, y - 2);
  });

  rightY += 80;

  // Tanda tangan
  // doc.fontSize(11).text("User", rightColX, rightY);
  // doc.text("Pihak Toko", rightColX + 150, rightY);

  // ===== FOOTER (TTD) =====
  let footerY = rightY + 30;
  doc.font("Helvetica").fontSize(11);
  doc.text("Hormat Kami,", rightColX, rightY);
  doc.text("Konsumen,", rightColX + 150, rightY);

  footerY += 60;
  doc.text("(____________)", rightColX - 10, rightY + 60);
  doc.text(`(____________)`, rightColX + 140, rightY + 60);

  doc
    .fontSize(14)
    .font("Times-Italic")
    .text("Terima Kasih atas Kepercayaannya.", 40, rightY + 20);
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
