const fs = require("fs");
const csv = require("csv-parser");

const results = [];
const inputFile = "data.xlsx - Sheet1.csv";
const outputFile = "output.json";

fs.createReadStream(inputFile)
  .pipe(csv())
  .on("data", (data) => {
    // ตรวจสอบว่ามีคอลัมน์ 'name' และ 'product' หรือไม่
    if (data.name && data.product) {
      results.push({
        name: data.name,
        product: data.product,
      });
    }
  })
  .on("end", () => {
    // เขียนข้อมูลลงในไฟล์ JSON
    fs.writeFile(outputFile, JSON.stringify(results, null, 2), (err) => {
      if (err) {
        console.error("เกิดข้อผิดพลาดในการเขียนไฟล์ JSON:", err);
      } else {
        console.log(
          `ดึงข้อมูลสำเร็จและบันทึกเป็นไฟล์ ${outputFile} เรียบร้อยแล้ว`
        );
      }
    });
  });
