const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// 1. Cấu hình nơi lưu ảnh (Thư mục 'uploads')
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Lưu vào thư mục uploads
    },
    filename: function (req, file, cb) {
        // Đặt tên file là: thời-gian-hiện-tại + tên-gốc (để tránh trùng)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 2. Phục vụ file tĩnh (HTML, CSS, JS frontend)
app.use(express.static('public'));

// 3. Cung cấp đường dẫn để xem ảnh đã lưu
app.use('/images', express.static('uploads'));

// 4. API Upload: Nhận ảnh từ Frontend -> Lưu -> Trả về mã ngắn
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Không có file nào được tải lên' });
    }
    
    // Đây là "Mã ngắn" mà bạn muốn (ví dụ: [img:1715...png])
    const shortCode = `[img:${req.file.filename}]`;
    
    // Trả về mã này cho giao diện
    res.json({ 
        success: true, 
        tag: shortCode, 
        url: `/images/${req.file.filename}` 
    });
});

app.listen(port, () => {
    console.log(`Ứng dụng đang chạy tại: http://localhost:${port}`);
});