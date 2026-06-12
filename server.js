// server.js snippet strategy
io.on('connection', (socket) => {
  socket.on('joinNote', (noteId) => {
    socket.join(noteId);
  });
  socket.on('editNote', (data) => {
    // Save to SQLite here, then broadcast:
    socket.to(data.noteId).emit('noteUpdated', data.content);
  });
});

// server.js snippet strategy
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });
app.post('/api/upload', upload.single('image'), (req, res) => {
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});
