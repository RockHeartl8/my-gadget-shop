const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// --- 1. Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

// --- 2. Database Connection ---
const mongoURI = "mongodb+srv://admin:RockHeart_2548@cluster0.hnhzatk.mongodb.net/shopDB?retryWrites=true&w=majority";
mongoose.connect(mongoURI)
    .then(() => console.log("เชื่อมต่อ shopDB สำเร็จ!"))
    .catch(err => console.log("Error:", err));

// --- 3. Models ---
const User = mongoose.model('User', { 
    username: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] 
});

const Product = mongoose.model('Product', { 
    name: String, 
    price: Number, 
    img: String, 
    category: String, 
    stock: { type: Number, default: 10 } 
});

const Order = mongoose.model('Order', {
    username: String,
    items: [String], // รายชื่อสินค้าที่ถูกซื้อ
    total: Number,   // ยอดรวมเงินในบิลนั้น
    date: { type: Date, default: Date.now }
});

// --- 4. API Routes ---

// --- ส่วนที่ 1: จัดการสินค้า (Inventory) ---
app.get('/api/products', async (req, res) => {
    try {
        const { category } = req.query;
        let products = (category && category !== 'all') 
            ? await Product.find({ category }) 
            : await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "ดึงข้อมูลไม่สำเร็จ" });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: "เพิ่มสินค้าไม่สำเร็จ" });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "ลบสำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "ลบไม่สำเร็จ" });
    }
});

// --- ส่วนที่ 2: ระบบสมาชิก (Auth & Management) ---
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "สมัครสำเร็จ" });
    } catch (err) { res.status(400).json({ message: "ชื่อซ้ำ" }); }
});

app.post('/api/login', async (req, res) => {
    const user = await User.findOne(req.body);
    if (user) res.json({ message: "สำเร็จ", role: user.role, username: user.username });
    else res.status(401).json({ message: "ข้อมูลผิด" });
});

// ดึงข้อมูล User ทั้งหมดสำหรับ Admin Dashboard
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถดึงข้อมูลสมาชิกได้" });
    }
});

// ลบสมาชิกออกจากระบบ
app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "ลบสมาชิกสำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "ลบสมาชิกไม่สำเร็จ" });
    }
});

// --- ส่วนที่ 3: ระบบออเดอร์และยอดขาย ---
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: "บันทึกออเดอร์สำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "บันทึกออเดอร์ล้มเหลว" });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถดึงข้อมูลยอดขายได้" });
    }
});

app.post('/api/purchase', (req, res) => {
    res.json({ status: "success", message: "สั่งซื้อสำเร็จ!" });
});

// --- 5. Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`รันที่พอร์ต ${PORT}`));