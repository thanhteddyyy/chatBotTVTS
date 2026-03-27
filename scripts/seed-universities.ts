import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import path from "path";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dataPath = path.join(process.cwd(), "data", "university_data_final.json");
const rawData = JSON.parse(readFileSync(dataPath, "utf8"));

// Chỉ lấy trường đầu tiên (KSA)
const testUni = rawData[0];

async function testSeedOneUniversity() {
  console.log("🔄 Đang test seed chỉ 1 trường: KSA...");

  const minimal = {
    ma_truong: testUni.ma_truong,
    ten_truong: testUni.ten_truong,
    tinh_thanh: testUni.tinh_thanh || "",
    mien: testUni.mien || "",
  };

  try {
    await setDoc(doc(db, "universities", "KSA"), minimal);
    console.log("🎉 THÀNH CÔNG! Đã tạo collection universities với 1 trường KSA.");
    console.log("Vào Firebase Console → Firestore → universities để kiểm tra.");
  } catch (err: any) {
    console.error("❌ LỖI:", err.message);
  }
}

testSeedOneUniversity().catch(console.error);