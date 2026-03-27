import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";

// ==================== KHỞI TẠO ADMIN SDK ====================
const serviceAccountPath = path.join(process.cwd(), "service-account.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedWithAdmin() {
  console.log("🚀 BẮT ĐẦU SEED BẰNG ADMIN SDK (siêu ổn định)...");

  const dataPath = path.join(process.cwd(), "data", "university_data_final.json");
  const rawData = JSON.parse(readFileSync(dataPath, "utf8"));

  for (const uni of rawData) {
    const maTruong = uni.ma_truong;
    const minimal = {
      ma_truong: maTruong,
      ten_truong: uni.ten_truong,
      tinh_thanh: uni.tinh_thanh || "",
      mien: uni.mien || "",
    };

    try {
      await db.collection("universities").doc(maTruong).set(minimal);
      console.log(`✅ THÀNH CÔNG: ${maTruong} — ${uni.ten_truong}`);
    } catch (err: any) {
      console.error(`❌ LỖI ${maTruong}:`, err.message);
    }
  }

  console.log("🎉 HOÀN TẤT! Collection universities đã được tạo.");
  console.log("Mở Firebase Console → Firestore để kiểm tra.");
}

seedWithAdmin().catch(console.error);