const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required!" });
    }

    if (users.find((user) => user.username === username)) {
        return res.status(409).json({ message: "Username already exists! Please choose another one." });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully." });
});

const getBooks = () => {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
};

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    const books = await getBooks();
    return res.json(books);
});

const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        let id = parseInt(isbn);
        resolve(books[id]);
    });
};

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const book = await getBookByISBN(req.params.isbn);
    if (book) {
        return res.json(book);
    }

    return res.status(404).json({ message: "ISBN doesn't exist!" });
});

const getBooksByAuthor = (author) => {
    return new Promise(async (resolve, reject) => {
        const books = await getBooks();

        const book = Object.values(books).find(b => b.author === author);
        resolve(book);
    })
};

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    getBooksByAuthor(author)
        .then(book => {
            if (book) {
                return res.json(book);
            }

            return res.status(404).json({ message: "The author doesn't exist!" });
        });
});

const getBooksByTitle = (title) => {
    return new Promise(async (resolve, reject) => {
        const books = await getBooks();

        const book = Object.values(books).find(b => b.title === title);
        resolve(book);
    })
};

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    getBooksByTitle(title)
        .then(book => {
            if (book) {
                return res.json(book);
            }

            return res.status(404).json({ message: "The title doesn't exist!" });
        });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = parseInt(req.params.isbn);
    if (!isNaN(isbn)) {
        return res.json(books[isbn].reviews);
    }

    return res.status(404).json({ message: "The ISBN doesn't exist!" });
});

module.exports.general = public_users;
