import dashboardService from "../service/dashboard.service.js";

const technician = async (req, res, next) => {
  try {
    const data = await dashboardService.getTechnicianDashboard(req.user?.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const sparepart = async (req, res, next) => {
  try {
    const data = await dashboardService.getSparepartDashboard();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const admin = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboard();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export default {
  technician,
  sparepart,
  admin,
};
