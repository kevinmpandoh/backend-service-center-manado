// src/controller/sparepart.controller.js
import sparepartService from "../service/sparepart.service.js";
import { validate } from "../validation/validate.js";
import {
  createSparepartSchema,
  updateSparepartSchema,
} from "../validation/sparepart.schema.js";

export const create = async (req, res, next) => {
  try {
    const data = validate(createSparepartSchema, req.body);
    const result = await sparepartService.create(data);
    res
      .status(201)
      .json({ message: "Sparepart berhasil ditambahkan", data: result });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { page, limit, q } = req.query;
    const result = await sparepartService.getAll({ page, limit, search: q });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getSparepartsUsage = async (req, res, next) => {
  try {
    const { page, limit, q, startDate, endDate } = req.query;
    const data = await sparepartService.getUsedSpareparts({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      q: q || "",
      startDate,
      endDate,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const result = await sparepartService.getById(req.params.id);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = validate(updateSparepartSchema, req.body);
    const result = await sparepartService.update(req.params.id, data);
    res.json({ message: "Sparepart berhasil diperbarui", data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await sparepartService.remove(req.params.id);
    res.json({ message: "Sparepart berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};

export const exportUsedSparepartsController = async (req, res, next) => {
  try {
    const { q, startDate, endDate, format } = req.query;

    if (format === "pdf") {
      const doc = await sparepartService.exportUsedSparepartsToPDF({
        q,
        startDate,
        endDate,
      });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=laporan_sparepart.pdf"
      );
      res.setHeader("Content-Type", "application/pdf");

      doc.pipe(res);
      doc.end();
    } else {
      const workbook = await sparepartService.exportUsedSparepartsToExcel({
        q,
        startDate,
        endDate,
      });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=laporan_sparepart.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (error) {
    next(error);
  }
};
