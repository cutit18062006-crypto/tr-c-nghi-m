const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// 1. Cấu hình nơi lưu ảnh (Chuyển vào public/images)
// Đường dẫn này giúp Vercel thấy được ảnh khi bạn push lên GitHub
const uploadDir = path.join(__dirname, 'public', 'images');

// Tự động tạo thư mục nếu chưa có
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Lưu trực tiếp vào public/images
    },
    filename: function (req, file, cb) {
        // Giữ tên file gốc hoặc đặt tên theo thời gian
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 2. Phục vụ file tĩnh
// Khi chạy localhost:3000, nó sẽ coi thư mục 'public' là gốc
app.use(express.static('public'));

// 3. API Upload
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Không có file nào được tải lên' });
    }
    
    // Mã ngắn để bạn dán vào đề thi
    const shortCode = `[img:${req.file.filename}]`;
    
    res.json({ 
        success: true, 
        tag: shortCode, 
        // URL này sẽ hoạt động cả trên local và Vercel (vì /images nằm trong /public)
        url: `/images/${req.file.filename}` 
    });
});

app.listen(port, () => {
    console.log(`Ứng dụng đang chạy tại: http://localhost:${port}`);
});