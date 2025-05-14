const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 5000;
const SECRET = 'your_jwt_secret';

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "password",
    database: 'AlgoAnalytics' 
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err.message);
        process.exit(1);
    }
    console.log("MySQL Connected");
});

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Access denied');
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user;
        next();
    });
};

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
        db.execute(sql, [username, email, hashedPassword], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "User registered successfully!" });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error while registering user' });
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.execute(sql, [email], async (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = results[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

app.post('/notes', authenticateToken, (req, res) => {
    const { title, content } = req.body;
    const wordCount = content.split(' ').length;

    if (wordCount > 500) return res.status(400).json({ error: 'Word limit exceeded!' });

    const sql = 'INSERT INTO notes (user_id, title, content, word_count) VALUES (?, ?, ?, ?)';
    db.execute(sql, [req.user.id, title, content, wordCount], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Note created!' });
    });
});

app.get('/notes', authenticateToken, (req, res) => {
    db.execute('SELECT * FROM notes WHERE user_id = ?', [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/notes/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.execute('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Note not found' });
        res.json(results[0]);
    });
});

app.put('/notes/:id', authenticateToken, (req, res) => {
    const { title, content } = req.body;
    const wordCount = content.split(' ').length;

    const updateQuery = `
        UPDATE notes
        SET title = ?, content = ?, word_count = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
    `;
    db.execute(updateQuery, [title, content, wordCount, req.params.id, req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Note updated!' });
    });
});

app.delete('/notes/:id', authenticateToken, (req, res) => {
    const sql = 'DELETE FROM notes WHERE id = ? AND user_id = ?';
    db.execute(sql, [req.params.id, req.user.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Note deleted!' });
    });
});

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
