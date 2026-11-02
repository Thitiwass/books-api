
const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// จำลองข้อมูลหนังสือ
let books = [
    {
        id: 1,
        title: "Clean Code",
        author: "Robert C. Martin",
        publishedYear: 2008,
        isAvailable: true
    }
];

// GET: ดึงหนังสือทั้งหมด
app.get('/books', (req, res) => {
    res.status(200).json(books);
});

// GET: ดึงหนังสือจาก ID
app.get('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.status(200).json(book);
});

// POST: เพิ่มหนังสือ
app.post('/books', (req, res) => {
    const { title, author, publishedYear, isAvailable } = req.body;

    if (
        typeof title !== 'string' || !title.trim() ||
        typeof author !== 'string' || !author.trim() ||
        typeof publishedYear !== 'number' ||
        !Number.isInteger(publishedYear) ||
        typeof isAvailable !== 'boolean'
    ) {
        return res.status(400).json({
            message: "Invalid book data"
        });
    }

    const newId = books.length > 0
        ? Math.max(...books.map(book => book.id)) + 1
        : 1;

    const newBook = {
        id: newId,
        title,
        author,
        publishedYear,
        isAvailable
    };

    books.push(newBook);

    res.status(201).json(newBook);
});

// PUT: แก้ไขหนังสือ
app.put('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const { title, author, publishedYear, isAvailable } = req.body;

    if (
        typeof title !== 'string' || !title.trim() ||
        typeof author !== 'string' || !author.trim() ||
        typeof publishedYear !== 'number' ||
        !Number.isInteger(publishedYear) ||
        typeof isAvailable !== 'boolean'
    ) {
        return res.status(400).json({
            message: "Invalid book data"
        });
    }

    book.title = title;
    book.author = author;
    book.publishedYear = publishedYear;
    book.isAvailable = isAvailable;

    res.status(200).json(book);
});

// DELETE: ลบหนังสือ
app.delete('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    books.splice(index, 1);

    res.status(200).json({
        message: "Book deleted successfully"
    });
});

// เปิดใช้งาน Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
