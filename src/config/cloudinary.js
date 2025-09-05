import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

cloudinary.config({
  cloud_name: env.cloudinary.cloud_name,
  api_key: env.cloudinary.api_key,
  api_secret: env.cloudinary.api_secret,
});

export const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "payments" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

export const deleteFromCloud = async (fileUrl) => {
  try {
    // contoh: https://res.cloudinary.com/demo/image/upload/v1692111111/profile/abcd1234.jpg
    // ambil "profile/abcd1234" sebagai public_id
    const parts = fileUrl.split("/");
    const fileWithExt = parts.slice(-2).join("/"); // "profile/abcd1234.jpg"
    const publicId = fileWithExt.substring(0, fileWithExt.lastIndexOf(".")); // "profile/abcd1234"

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    throw new Error("Gagal menghapus file dari Cloudinary: " + err.message);
  }
};
