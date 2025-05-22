require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Configuration
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Atlas Connection
const atlasUri = 'mongodb+srv://YalakaturiNarendra:Narendrachowdary%402004@cluster0.cczbthx.mongodb.net/bookNotes?retryWrites=true&w=majority';

mongoose.connect(atlasUri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => console.log("✅ MongoDB Connected Successfully!"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// Database Schema and Model
const bookSchema = new mongoose.Schema({}, { strict: false });
const Book = mongoose.model('Books', bookSchema, 'books');

// Routes
app.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.render('notes', { bookslist: books });
    } catch(err) {
        console.error("Error fetching books:", err);
        res.status(500).send("Error loading books");
    }
});

app.get('/create', (req, res) => {
    res.render('createNotes');
});

app.get('/create-note', async (req, res) => {
    try {
        const newBook = new Book(req.query);
        await newBook.save();
        console.log("New note added successfully");
        res.redirect('/');
    } catch(err) {
        console.error("Error saving new note:", err);
        res.status(500).send("Error creating note");
    }
});
app.get('/notes', (req, res) => {
    const notesList = [
        { bookTitle: "Book 1", brief: "Brief for Book 1", notes: "Some notes about Book 1" },
        { bookTitle: "Book 2", brief: "Brief for Book 2", notes: "Some notes about Book 2" }
    ];
    
    console.log(notesList);  // Check if data is correct

    res.render('notes', { notes: notesList });
});
app.get('/update', async (req, res) => {
    try {
        const books = await Book.find();
        res.render('update', { bookslist: books });
    } catch(err) {
        console.error("Error fetching books for update:", err);
        res.status(500).send("Error loading update page");
    }
});

app.get('/update-note', async (req, res) => {
    try {
        const bookTitle = req.query.bookt; // Get book title from query params
        if (!bookTitle) {
            return res.status(400).send("Book title is required");
        }

        const bookData = await Book.findOne({ bookTitle: bookTitle });

        // If no book is found
        if (!bookData) {
            return res.status(404).send("Book not found");
        }

        // If book is found, pass it to the view
        res.render('updateNotesData', { dab: bookData });
    } catch (err) {
        console.error("Error finding book to update:", err);
        res.status(500).send("Error finding book");
    }
});



app.get('/upNote', async (req, res) => {
    try {
        await Book.updateOne(
            { bookTitle: req.query.oldt },
            { $set: { 
                bookTitle: req.query.booktitle,
                brief: req.query.brief,
                linkofbook: req.query.linkofbook,
                notes: req.query.notes 
            } }
        );
        console.log("Book updated successfully");
        res.redirect('/');
    } catch(err) {
        console.error("Error updating book:", err);
        res.status(500).send("Error updating book");
    }
});

app.get('/delete', async (req, res) => {
    try {
        const books = await Book.find();
        res.render('deletenotes', { bookslist: books });
    } catch(err) {
        console.error("Error fetching books for deletion:", err);
        res.status(500).send("Error loading delete page");
    }
});

app.get('/delNote', async (req, res) => {
    try {
        await Book.deleteOne({ bookTitle: req.query.bt });
        console.log("Book deleted successfully");
        res.redirect('/');
    } catch(err) {
        console.error("Error deleting book:", err);
        res.status(500).send("Error deleting book");
    }
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
});