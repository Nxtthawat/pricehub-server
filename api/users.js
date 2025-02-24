import express from 'express';
import priceHubDB from '../db.js';
import md5 from 'md5';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import auth from '../auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try{
        const db = await priceHubDB;

        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;

        var result = {};
        if(username && password && email){
            var sql = "SELECT * FROM users WHERE username = ? OR email = ?";
            db.query(sql, [username, email], (err, rows) => {
                if(err){
                    res.status(400).send(err);
                    res.send(err);
                }else{
                    if(rows.length > 0){
                        result = {
                            status: 400,
                            message: "มีชื่อผู้ใช้หรืออีเมลนี้ในระบบแล้ว"
                        }
                        res.status(result.status).send(result.message);
                    }else{
                        var sql = "INSERT INTO users (username, password, email, role, pfp) VALUES (?, ?, ?, 'member', 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png')";
                        db.query(sql, [username, md5(password), email], (err, rows) => {
                            if(err){
                                res.status(500).send(err);
                            }else{
                                var sql = "SELECT * FROM users WHERE username = ? AND password = ?";
                                db.query(sql, [username, md5(password)], (err, rows) => {
                                    if(err){
                                        res.status(500).send("Internal server error");
                                        res.send(err);
                                    }else{
                                        const token = auth.getToken({
                                            username: rows[0].username,
                                            userId: rows[0].userID,
                                        })
                                        result = {
                                            status: 200,
                                            message: "สมัครสมาชิกสำเร็จ",
                                            token: token,
                                        }
                                        res.status(result.status).send(result);
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }else{
            result = {
                status: 400,
                message: "Please fill in all fields"
            }
            res.status(result.status).send(result.message);
        }
    }catch{
        res.status(500).send("FCCK");
    }
});

router.post('/login', async (req, res) => {
    try{
        const db = await priceHubDB;
        
        const username = req.body.username;
        const password = req.body.password;

        var result = {};

        var sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        db.query(sql, [username, md5(password)], (err, rows) => {
            if(err){
                res.status(500).send(err);
            }else{
                if(rows.length > 0){
                    console.log(rows[0]);
                    const token = auth.getToken({
                        username: rows[0].username,
                        userId: rows[0].user_id,
                    })

                    result = {
                        status: 200,
                        message: "เข้าสู่ระบบสำเร็จ",
                        token: token,
                        
                    }
                }else{
                    result = {
                        status: 400,
                        message: "รหัสผ่านหรือชื่อผู้ใช้ไม่ถูกต้อง"
                    }
                }
                res.status(result.status).send(result);
            }
        });
    }catch{
        res.status(500).send("Internal server error");
    }

});

router.get('/getUser', auth.autherizeMiddleware, async (req, res) => {
    try{
        const db = await priceHubDB;

        var result = {};

        var sql = "SELECT * FROM users WHERE user_id = ?";
        db.query(sql, [req.data.userId], (err, rows) => {
            if(err){
                res.status(500).send("Internal server error");
                console.log(err);
            }else{
                if(rows.length > 0){
                    result = {
                        status: 200,
                        message: "User found",
                        data: rows[0]
                    }
                    res.status(result.status).send(result);
                }else{
                    result = {
                        status: 404,
                        message: "User not found"
                    }
                    res.status(result.status).send(result);
                }
            }
        });
    }catch (err){
        res.status(500).send("Internal server error");
        console.log(err);
    }
});

router.get('/getAllUser', async (req, res) => {
    try{
        const db = await priceHubDB;

        var result = {};

        var sql = "SELECT * FROM users";
        db.query(sql, (err, rows) => {
            if(err){
                res.status(500).send("Internal server error");
                console.log(err);
            }else{
                if(rows.length > 0){
                    result = {
                        status: 200,
                        message: "User found",
                        data: rows
                    }
                    res.status(result.status).send(result);
                }else{
                    result = {
                        status: 404,
                        message: "User not found"
                    }
                    res.status(result.status).send(result);
                }
            }
        });
    }catch (err){
        res.status(500).send("Internal server error");
        console.log(err);
    }
});

export default router;