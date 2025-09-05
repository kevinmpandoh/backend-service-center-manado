// src/service/notification.service.js
import axios from "axios";
import { ResponseError } from "../utils/error.js";

export const sendWhatsApp = async (phone, message) => {
  const token = process.env.FONNTE_TOKEN;

  console.log(token, phone, message);
  if (!token) {
    throw new ResponseError(500, "Token Fonnte tidak ditemukan");
  }

  try {
    const response = await axios.post(
      "https://api.fonnte.com/send",
      {
        target: phone,
        message: message,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    console.log("Notifikasi WA berhasil:", response.data);
    return response.data;
  } catch (error) {
    throw new ResponseError(400, "Gagal mengirim notifikasi WhatsApp", {
      error: error.response?.data || error.message,
    });
  }
};
