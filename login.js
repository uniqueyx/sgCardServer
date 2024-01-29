let http = require('http');
let express = require('express');
let cors = require('cors');
let bodyParser = require('body-parser');
let socket = require("socket.io");
const fs = require('fs');
// let sh=require('./socketHandle');
let rh=require('./roomHandle');
const createDBConnection=require('./db');
const dayjs=require('dayjs')

// import { v4 as uuid } from "uuid";

let app = express();

// let handleSynchronousClient = require('./handler');

//app.use(cors({origin:'*'}));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// let server = http.createServer(app);
const connection = createDBConnection();
//注册 登录
app.post("/register", (req, res)=> {
    const { account, password ,nick} = req.body;
    console.log("req.body",req.body);
    connection.query(
      `insert into user (account, password, nick, ctime) VALUES (?, ?, ?, ?)`,
      [account, password,nick, dayjs().format("YYYY-MM-DD HH:mm:ss")],//md5(password)
      (err) => {
        if (err) {
          if (err.errno === 1062) {
            res.json({message:"账号已存在"});
            return;
          }
          res.json({message:"数据库异常"});
          return;
        }
        console.log(account,"注册成功");
        res.json({result:1});
      }
    );
  });

 app.post("/login", (req, res)=> {
    const { account, password } = req.body;

    // connection.query(`select password from user where account = ?`, [account], (err, result) => {
    connection.query(`select * from user where account = ? and password = ?`, [account,password], (err, result) => {
      if (err) {
        res.json({message:"数据库异常"});
        return;
      }

      if(result.length==0){
        res.json({message:"账号或密码错误"});
        return;
      }
      // const user = result[0];
      // if (!user || password !== user.password) {//md5(password) !== user.password
      //   res.json({message:"账号或密码错误"});
      //   return;
      // }

      // const token = uuid();
      // cache.set(token, account);
      console.log(account,"登录成功",result[0].nick);
      res.json(
        {result:1,data:result[0]}
        // createRes(CodeEnum.LoginSuccess, {
        //   token,
        // })
      );
    });
  });

// server.listen(3004, function () {
//         console.log("login listen 3004");
//     });

 app.listen(3004, () => {
    console.log("login HTTP服务启动")
  });

