const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// เชื่อมต่อฐานข้อมูล (แบบจำลอง)
const mongoURI = "mongodb+srv://admin:RockHeart_2548@cluster0.hnhzatk.mongodb.net/shopDB?retryWrites=true&w=majority";
mongoose.connect(mongoURI)
    .then(() => console.log("เชื่อมต่อฐานข้อมูล Cloud สำเร็จแล้ว!"))
    .catch(err => console.error("เชื่อมต่อไม่สำเร็จเพราะ: ", err));

const Product = mongoose.model('Product', {
    name: String, price: Number, img: String
});

// ก๊อปปี้ส่วนนี้ไปทับ app.get ตัวเก่าใน server.js (ประมาณบรรทัดที่ 18-27)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find(); // ดึงข้อมูลจาก MongoDB ของจริง
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});

// เพิ่ม API สำหรับเพิ่มสินค้าใหม่ (ใช้ทดสอบ) 
// วางแทนที่บรรทัดสุดท้ายเดิม เพื่อให้ Server บน Cloud กำหนด Port เองได้
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});