const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Inisialisasi OpenAI dengan API key dari environment variable
const openai = new OpenAI({
  apiKey: proccess.env.OPENAI_API_KEY, // Pastikan API key diatur di environment
});

// Endpoint untuk menangani permintaan chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Validasi pesan
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong!' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Ganti model jika diperlukan
      messages: [
        { role: 'user', content: message },
      ],
    });

    res.json(completion.choices[0].message); // Kirim respon ke klien
  } catch (error) {
    console.error('Error pada OpenAI API:', error);
    res.status(500).json({ error: error.message || 'Terjadi kesalahan pada server' });
  }
});

// Endpoint untuk menyajikan file index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware untuk menyajikan file statis
app.use(express.static(path.join(__dirname, 'public')));

// Log setiap request masuk (opsional, untuk debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
