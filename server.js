const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 1. Database Initialization
const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, content TEXT)");
});

// 2. Middleware & Static Files
app.use(express.static('public'));
app.use(express.json());

// 3. Image Upload Configuration
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 4. REST API Routes
app.get('/api/notes/:id', (req, res) => {
  db.get("SELECT content FROM notes WHERE id = ?", [req.params.id], (err, row) => {
    res.json({ content: row ? row.content : '[]' });
  });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// 5. Real-Time Collaboration (WebSockets)
io.on('connection', (socket) => {
  socket.on('joinNote', (noteId) => {
    socket.join(noteId);
  });
  
  socket.on('editNote', (data) => {
    // Upsert the latest state into SQLite, then broadcast to all other connected clients
    db.run(
      "INSERT INTO notes (id, content) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET content=excluded.content", 
      [data.noteId, data.content]
    );
    socket.to(data.noteId).emit('noteUpdated', data.content);
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server executing locally on port ${PORT}`));

