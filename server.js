const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // เปิดทางให้เข้าถึงหน้า HTML ในโฟลเดอร์ public

// ฐานข้อมูลอุปกรณ์คอมพิวเตอร์
const mongoURI = "mongodb+srv://admin:RockHeart_2548@cluster0.hnhzatk.mongodb.net/shopDB?retryWrites=true&w=majority";
mongoose.connect(mongoURI).then(() => console.log("เชื่อมต่อ shopDB สำเร็จ!")).catch(err => console.log(err));

// โมเดลข้อมูล
const User = mongoose.model('User', { 
    username: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },
    role: { type: String, default: 'user' } 
});

const Product = mongoose.model('Product', { 
    name: String, price: Number, img: String, stock: { type: Number, default: 10 } 
});

// --- API สำหรับร้านค้าอุปกรณ์คอมพิวเตอร์ ---

app.get('/api/products', async (req, res) => { // ดึงรายการอุปกรณ์ทั้งหมด
    const products = await Product.find();
    res.json(products);
});

app.post('/api/products', async (req, res) => { // แอดมินเพิ่มอุปกรณ์ใหม่
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
});

app.delete('/api/products/:id', async (req, res) => { // แอดมินลบอุปกรณ์ออกจากคลัง
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "ลบสำเร็จ" });
});

app.post('/api/register', async (req, res) => { // สมัครสมาชิก
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "สมัครสำเร็จ" });
    } catch (err) { res.status(400).json({ message: "ชื่อซ้ำ" }); }
});

app.post('/api/login', async (req, res) => { // เข้าสู่ระบบ
    const user = await User.findOne(req.body);
    if (user) res.json({ message: "สำเร็จ", role: user.role, username: user.username });
    else res.status(401).json({ message: "ข้อมูลผิด" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`รันที่พอร์ต ${PORT}`)); //