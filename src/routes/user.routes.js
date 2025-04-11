import { UserController } from "../controller/user.controller.js";
import express from "express";

const router = express.Router();

router.get("/", UserController.getAllUser);

export default router;
