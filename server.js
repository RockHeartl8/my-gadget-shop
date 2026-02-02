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

// 1. Model สำหรับสมาชิก (วางทับของเดิมเพื่อเพิ่มระบบ User และสต็อก)
const User = mongoose.model('User', {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }, // 'admin' หรือ 'user'
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] 
});

const Product = mongoose.model('Product', {
    name: String,
    price: Number,
    img: String,
    stock: { type: Number, default: 10 } // เพิ่มจำนวนของในคลัง
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

    // --- ระบบสมัครสมาชิก และ Login ---
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = new User({ username, password }); // ในงานจริงควรแฮชรหัสผ่านด้วย bcrypt
        await newUser.save();
        res.status(201).json({ message: "สมัครสมาชิกสำเร็จ!" });
    } catch (err) {
        res.status(400).json({ message: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.json({ message: "เข้าสู่ระบบสำเร็จ", role: user.role, username: user.username });
    } else {
        res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
});

// --- ระบบแจ้งเตือนการซื้อ (สั่งซื้อจำลอง) ---
app.post('/api/purchase', (req, res) => {
    res.json({ status: "success", message: "ซื้อสินค้าสำเร็จ! แจ้งเตือนไปยังระบบจัดการแล้ว" });
});
});