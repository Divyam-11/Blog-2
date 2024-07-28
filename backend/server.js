const express = require("express");
const app = express();
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/userModel');
const Post = require('./models/Post')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const salt = bcrypt.genSaltSync(10);
const cookieParser = require('cookie-parser');
const secret = 'realistic';
const multer = require('multer');
const uploadMiddleware = multer({dest: 'uploads/'});
const fs = require('fs');
app.use(cors({credentials: true, origin: 'http://localhost:5173'}));
app.use(express.json());
app.use(cookieParser())
app.use('/uploads', express.static(__dirname + '/uploads'));
require('dotenv').config();
mongoose.connect(process.env.CONNECT_STRING);

app.post('/register', async (req, res) => {
    const {username, password} = req.body;
    try {

        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    } catch (e) {
        res.status(400).json(e);
    }
})
app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compare(password, userDoc.password);
    if (passOk) {
        // user logins
        jwt.sign({username, id: userDoc._id}, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).json({
                id: userDoc._id,
                username,
            });
        });

    } else {
        res.status(400).json('wrong credentials')
    }
})
app.get('/profile', (req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) throw err;
        res.json(info);
    })
})
app.post("/logout", (req, res) => {
    res.cookie('token', '').json('ok');
})
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const {title, summary, content} = req.body;
        const PostDoc = await Post.create({
            title,
            summary,
            content,

            cover: newPath,
            author: info.id,
        })

        res.json(PostDoc);
    })

})
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;
    if (req.file) {
        const {originalname, path} = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const {id, title, summary, content} = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
            res.status(400).json('you are not the author');

        }
        await postDoc.updateOne({
            title, summary, content,
            cover: newPath ? newPath : postDoc.cover,
        })
        const PostDoc = await Post.updateOne({
            title,
            summary,
            content,

            cover: newPath,
            author: info.id,
        })

        res.json(PostDoc);
    })

})
app.get('/post', async (req, res) => {
    const posts = await Post.find().populate('author', ['username']).sort({createdAt: -1}).limit(20);
    res.json(posts);
})
app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
})
app.listen(4000);
