const fs = require("fs").promises;
const axios = require("axios");

// --- ⚙️ ตั้งค่าตรงนี้ ---
const YOUR_WORDPRESS_URL = "https://smilemeat.co.th"; // แนะนำให้เอา "/" ตัวสุดท้ายออก
const POST_TYPE_SLUG = "product"; // **สำคัญ!** ตรวจสอบให้แน่ใจว่า Slug นี้ถูกต้อง 100%
const YOUR_USERNAME = "admin"; // Username ของผู้ใช้ที่เป็น Administrator
const YOUR_APPLICATION_PASSWORD = "xxxx xxxx xxxx xxxx xxxx xxxx"; // ⬅️ **สำคัญ!** สร้างและใส่รหัสผ่านชุดใหม่ที่คัดลอกมาเป๊ะๆ
const INPUT_JSON_FILE = "output.json";
// --------------------

// สร้าง Authentication Header จาก Application Password
const credentials = Buffer.from(
  `${YOUR_USERNAME}:${YOUR_APPLICATION_PASSWORD}`
).toString("base64");

// ตั้งค่า Axios instance สำหรับยิง API
const api = axios.create({
  baseURL: YOUR_WORDPRESS_URL,
  headers: {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  },
});

// ฟังก์ชันสำหรับส่งข้อมูลไปสร้าง Post ใน JetEngine Post Type
async function createJetEnginePost(item) {
  try {
    // ⬇️ **แก้ไขจุดที่ 1:** เปลี่ยนกลับไปใช้ Endpoint ของ JetEngine
    const endpoint = `/wp-json/jet-engine/v2/posts/${POST_TYPE_SLUG}`;

    // ⬇️ **แก้ไขจุดที่ 2:** จัดโครงสร้าง Payload ให้ถูกต้องสำหรับ JetEngine API
    const payload = {
      status: "draft", // แนะนำให้เริ่มจาก 'draft' (ฉบับร่าง) เพื่อทดสอบ
      title: item.title_product, // ใช้ title_product เป็นหัวเรื่องของ Post
      // 'content' เป็นฟิลด์มาตรฐาน สามารถใส่ได้เลย
      // content: item.description_product,
      // 'fields' สำหรับใส่ข้อมูลใน Meta Fields ของ JetEngine เท่านั้น
      meta: {
        highlights_detail: item.highlights_detail,
        process_product: item.process_product,
        weight_product: item.weight_product,
        content_seo_detail: item.content_seo_detail,
        title: item.title_product,
        // สังเกตว่าผมเอา title_product และ description_product ออกจาก fields
        // เพราะมันควรจะอยู่ในระดับบนสุดของ payload
      },
      smilemeat_category: "20",
    };

    console.log(
      `🚀 กำลังสร้าง Post ใน "${POST_TYPE_SLUG}": "${item.title_product}"...`
    );
    const response = await api.post(endpoint, payload);

    // JetEngine API จะคืน post_id กลับมา
    console.log(
      `✅ สำเร็จ! สร้าง Post ID: ${response.data.post_id} - ${item.title_product}`
    );
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดกับ "${item.title_product}":`);
    if (error.response) {
      console.error("   - Status:", error.response.status);
      console.error("   - Data:", JSON.stringify(error.response.data, null, 2)); // แสดงผล Data ให้สวยงาม
    } else {
      console.error("   - Message:", error.message);
    }
  }
}

// ฟังก์ชันหลักสำหรับอ่านไฟล์และเริ่มทำงาน
async function processAndSendData() {
  try {
    const data = await fs.readFile(INPUT_JSON_FILE, "utf8");
    const items = JSON.parse(data);

    console.log(
      `พบข้อมูล ${items.length} รายการ เตรียมส่งไปยัง Post Type: "${POST_TYPE_SLUG}"`
    );

    // ทดลองรันแค่ 1 รายการก่อน
    const itemsToProcess = items.slice(0, 1);
    for (const item of itemsToProcess) {
      await createJetEnginePost(item);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("✨ การทำงานเสร็จสิ้น!");
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอ่านไฟล์ JSON หรือการทำงานหลัก:", error);
  }
}

// เริ่มทำงาน
processAndSendData();
