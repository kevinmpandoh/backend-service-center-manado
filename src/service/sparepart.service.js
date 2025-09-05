// src/service/sparepart.service.js
import serviceDetailRepository from "../repository/service-detail.repository.js";
import sparepartRepository from "../repository/sparepart.repository.js";
import { ResponseError } from "../utils/error.js";
import dayjs from "dayjs";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

const create = (data) => sparepartRepository.create(data);

const getAll = async ({ page = 1, limit = 10, search = "" }) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  const [total, data] = await Promise.all([
    sparepartRepository.count(query),
    sparepartRepository.find(query, skip, limit),
  ]);

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
  const part = await sparepartRepository.findById(id);
  if (!part) throw new ResponseError(404, "Sparepart tidak ditemukan");
  return part;
};

const update = async (id, data) => {
  const updated = await sparepartRepository.update(id, data);
  if (!updated) throw new ResponseError(404, "Sparepart tidak ditemukan");
  return updated;
};

const remove = async (id) => {
  const removed = await sparepartRepository.remove(id);
  if (!removed) throw new ResponseError(404, "Sparepart tidak ditemukan");
  return removed;
};

const getUsedSpareparts = async ({
  page = 1,
  limit = 10,
  q = "",
  startDate,
  endDate,
}) => {
  const query = { type: "sparepart" };

  // kalau ada date range dipakai
  if (startDate && endDate) {
    query.createdAt = {
      $gte: dayjs(startDate).startOf("day").toDate(),
      $lte: dayjs(endDate).endOf("day").toDate(),
    };
  } else {
    // default = hari ini
    query.createdAt = {
      $gte: dayjs().startOf("day").toDate(),
      $lte: dayjs().endOf("day").toDate(),
    };
  }

  // optional filter nama sparepart
  if (q) {
    query["sparepart.name"] = { $regex: q, $options: "i" };
  }

  const skip = (page - 1) * limit;

  // ambil data
  const [serviceDetails, total] = await Promise.all([
    serviceDetailRepository
      .find(query)
      .populate("sparepart")
      .populate({
        path: "serviceOrder",
        populate: { path: "technician" },
      })
      .skip(skip)
      .limit(limit)
      .exec(),
    serviceDetailRepository.count(query),
  ]);

  // mapping hasil
  const result = serviceDetails.map((detail) => ({
    id: detail._id,
    name: detail.sparepart?.name,
    technician: detail.serviceOrder?.technician?.name || "-",
    stock: detail.sparepart?.stock,
    sellingPrice: detail.sparepart?.sellPrice,
    quantity: detail.quantity || 1,
    total: detail.subtotal,
    date: detail.createdAt,
  }));

  return {
    data: result,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const exportUsedSparepartsToExcel = async ({ q, startDate, endDate }) => {
  const { data } = await getUsedSpareparts({
    page: 1,
    limit: 99999,
    q,
    startDate,
    endDate,
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Laporan Sparepart Terpakai");

  // Judul
  worksheet.mergeCells("A1", "F1");
  worksheet.getCell("A1").value = "Laporan Sparepart Terpakai";
  worksheet.getCell("A1").alignment = { horizontal: "center" };
  worksheet.getCell("A1").font = { bold: true, size: 16 };

  worksheet.mergeCells("A2", "F2");
  worksheet.getCell("A2").value = `Periode: ${
    startDate ? dayjs(startDate).format("DD MMM YYYY") : "-"
  } s/d ${endDate ? dayjs(endDate).format("DD MMM YYYY") : "-"}`;
  worksheet.getCell("A2").alignment = { horizontal: "center" };
  worksheet.getCell("A2").font = { italic: true };

  worksheet.addRow([]);

  // Header
  worksheet.addRow([
    "No",
    "Nama Sparepart",
    "Teknisi",
    "Qty",
    "Harga Jual",
    "Total",
  ]);

  const headerRow = worksheet.getRow(4);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center" };
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Isi data
  data.forEach((item, idx) => {
    worksheet.addRow([
      idx + 1,
      item.name,
      item.technician,
      item.quantity,
      item.sellingPrice,
      item.total,
    ]);
  });

  // Total keseluruhan
  const totalRow = worksheet.addRow([
    "",
    "",
    "",
    "",
    "Grand Total",
    data.reduce((sum, i) => sum + (i.total || 0), 0),
  ]);
  totalRow.font = { bold: true };

  // Auto width
  worksheet.columns.forEach((col) => {
    let maxLength = 0;
    col.eachCell({ includeEmpty: true }, (cell) => {
      maxLength = Math.max(
        maxLength,
        cell.value ? cell.value.toString().length : 0
      );
    });
    col.width = maxLength < 10 ? 10 : maxLength + 2;
  });

  return workbook;
};

export const exportUsedSparepartsToPDF = async ({ q, startDate, endDate }) => {
  const { data } = await getUsedSpareparts({
    page: 1,
    limit: 99999,
    q,
    startDate,
    endDate,
  });

  const doc = new PDFDocument({ margin: 30, size: "A4" });

  // Judul
  doc.fontSize(16).text("Laporan Sparepart Terpakai", {
    align: "center",
  });
  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .text(
      `Periode: ${
        startDate ? dayjs(startDate).format("DD MMM YYYY") : "-"
      } s/d ${endDate ? dayjs(endDate).format("DD MMM YYYY") : "-"}`,
      { align: "center" }
    );

  doc.moveDown(1);

  // Header tabel
  const tableTop = doc.y;
  const colWidths = [30, 150, 100, 50, 80, 80];

  const drawRow = (row, y) => {
    row.forEach((text, i) => {
      doc
        .fontSize(9)
        .text(text, 40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
          width: colWidths[i],
          align: i === 0 || i === 3 ? "center" : "left",
        });
    });
  };

  drawRow(
    ["No", "Nama Sparepart", "Teknisi", "Qty", "Harga Jual", "Total"],
    tableTop
  );
  doc.moveDown(0.5);

  // Isi data
  let y = doc.y + 5;
  data.forEach((item, idx) => {
    drawRow(
      [
        idx + 1,
        item.name,
        item.technician,
        item.quantity,
        item.sellingPrice,
        item.total,
      ],
      y
    );
    y += 18;
  });

  doc.moveDown(1);

  // Total keseluruhan
  doc
    .fontSize(10)
    .text(
      `Grand Total: Rp ${data.reduce((sum, i) => sum + (i.total || 0), 0)}`,
      { align: "right" }
    );

  return doc;
};

export default {
  create,
  getAll,
  getUsedSpareparts,
  exportUsedSparepartsToExcel,
  exportUsedSparepartsToPDF,
  getById,
  update,
  remove,
};
