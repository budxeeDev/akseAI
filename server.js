const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 4000;

app.use(cors()); // Izinkan permintaan lintas asal (CORS)
app.use(express.json()); // Untuk mem-parsing body JSON dari permintaan klien

// Inisialisasi OpenAI dengan API key
const openai = new OpenAI({
  apiKey: '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', // Ganti dengan API key kamu
});

// Endpoint untuk menangani permintaan chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Validasi apakah pesan kosong
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong!' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Atau 'gpt-4-mini' jika tersedia
      messages: [
        { role: 'user', content: message },
      ],
    });

    res.json(completion.choices[0].message); // Kirim respon kembali ke klien
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan pada server');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'
    
  ));
});

// Menyajikan file statis (misalnya index.html) dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Menjalankan server di port 4000
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});