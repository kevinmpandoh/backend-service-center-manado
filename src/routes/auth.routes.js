const router = Router();
import { authenticate } from "../../middlewares/auth.middleware";
import { AuthController } from "../controller/auth.controller";

// Admin
router.post("/admin/login", AuthController.login);

router.post("/logout", (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    res.status(200).json({ message: "Logout berhasil" });
  } catch (error) {
    next(error);
  }
});

export default router;
