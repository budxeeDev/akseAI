require('dotenv').config();

const express = require('express');
const OpenAI = require('openai');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Inisialisasi OpenAI API dengan API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Menyimpan riwayat percakapan dalam memori sementara
const chatHistories = {};

// Fungsi untuk menambahkan pesan ke riwayat percakapan
const updateChatHistory = (userId, role, content) => {
  if (!chatHistories[userId]) {
    chatHistories[userId] = [];
  }
  chatHistories[userId].push({ role, content });
};

// Endpoint untuk menangani chat text dengan memori
app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'User ID dan pesan wajib diisi.' });
    }

    // Tambahkan pesan pengguna ke riwayat
    updateChatHistory(userId, 'user', message);

    // Kirim riwayat percakapan ke OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatHistories[userId],
    });

    const aiResponse = completion.choices[0].message.content;

    // Tambahkan jawaban AI ke riwayat
    updateChatHistory(userId, 'assistant', aiResponse);

    // Kirim jawaban AI ke pengguna
    res.json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan pada server.');
  }
});

// Konfigurasi multer untuk upload gambar
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar (JPEG/PNG) yang diizinkan.'));
    }
  },
});

// Endpoint untuk upload gambar dan analisis
app.post('/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada gambar yang diunggah.' });
  }

  const imagePath = path.join(uploadDir, req.file.filename);

  try {
    // Proses analisis gambar (jika API mendukung)
    const imageAnalysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI assistant that can analyze images and answer questions about them.' },
        { role: 'user', content: 'Analyze this image.' },
      ],
    });

    const imageDescription = imageAnalysisResponse.choices[0].message.content;

    // Kirim hasil analisis
    res.json({ message: 'Gambar berhasil diunggah dan dianalisis.', description: imageDescription });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Gagal menganalisis gambar.' });
  } finally {
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
  }
});

// Menyajikan file statis dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
