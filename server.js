const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// --- 1. Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // เปิดทางให้เข้าถึงหน้า HTML ต่างๆ ในโฟลเดอร์ public

// --- 2. Database Connection ---
const mongoURI = "mongodb+srv://admin:RockHeart_2548@cluster0.hnhzatk.mongodb.net/shopDB?retryWrites=true&w=majority";
mongoose.connect(mongoURI)
    .then(() => console.log("เชื่อมต่อฐานข้อมูล Cloud สำเร็จแล้ว!"))
    .catch(err => console.error("เชื่อมต่อไม่สำเร็จเพราะ: ", err));

// --- 3. Models (โครงสร้างข้อมูลสมาชิกและอุปกรณ์คอมพิวเตอร์) ---
const User = mongoose.model('User', {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }, // แยกสิทธิ์ admin/user
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] 
});

const Product = mongoose.model('Product', {
    name: String,
    price: Number,
    img: String,
    stock: { type: Number, default: 10 } // จำนวนอุปกรณ์คอมฯ ในคลัง
});

// --- 4. API Routes (ระบบหลังบ้าน) ---

// ดึงรายการอุปกรณ์คอมพิวเตอร์ทั้งหมดมาโชว์ที่หน้าเว็บ
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});

// แอดมินเพิ่มอุปกรณ์คอมพิวเตอร์ใหม่เข้าคลัง
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: "ไม่สามารถเพิ่มสินค้าได้" });
    }
});

// แอดมินลบอุปกรณ์ออกจากคลัง
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "ลบสินค้าเรียบร้อยแล้ว" });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถลบสินค้าได้" });
    }
});

// ระบบสมัครสมาชิก
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: "สมัครสมาชิกสำเร็จ!" });
    } catch (err) {
        res.status(400).json({ message: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" });
    }
});

// ระบบเข้าสู่ระบบ
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.json({ message: "เข้าสู่ระบบสำเร็จ", role: user.role, username: user.username });
    } else {
        res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
});

// ระบบแจ้งเตือนการสั่งซื้อจำลอง
app.post('/api/purchase', (req, res) => {
    res.json({ status: "success", message: "ซื้อสินค้าสำเร็จ! แจ้งเตือนไปยังระบบจัดการแล้ว" });
});

// --- 5. Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});