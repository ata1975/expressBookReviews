const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const JWT_SECRET = "VERY_SECRET_PASSWORD";

let users = [];

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
        const accessToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: 3600 });
        req.session.authorization = { accessToken, username };
        return res.status(200).send("User successfully signed in!");
    } else {
        return res.status(400).json({ message: "Invalid username and/or password!" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    //Write your code here
    return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
