const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const verifyJwt = (req, res, next) => {
    const token = req.session.authorization?.accessToken;
    if (!token) {
        return res.status(403).json({ message: 'Access denied!' });
    }

    jwt.verify(token, "VERY_SECRET_PASSWORD", (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token!' });
        }

        req.user = user;
        next();
    });
};

const isValid = (username) => {
    return users.some((user) => user.username === username);
}

const authenticatedUser = (username, password) => {
    return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({ username }, "VERY_SECRET_PASSWORD", { expiresIn: 3600 });
        req.session.authorization = { accessToken, username };
        return res.status(200).send("User successfully signed in!");
    } else {
        return res.status(400).json({ message: "Invalid username and/or password!" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", verifyJwt, (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.authorization.username;
    if (books[isbn]) {
        books[isbn].reviews[username] = review;
        return res.status(200).send("Review successfully added.");
    } else {
        return res.status(404).json({ message: "ISBN not found!" });
    }
});

regd_users.delete("/auth/review/:isbn", verifyJwt, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    const book = books[isbn];
    if (book) {
        if (book.reviews[username]) {
            delete book.reviews[username];
            return res.status(200).send("Review successfully removed!");
        } else {
            return res.status(404).json({ message: "Review not found for this user!" });
        }
    } else {
        return res.status(404).json({ message: `ISBN ${isbn} not found` });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
