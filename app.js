let http = require('http');
let express = require('express');
let cors = require('cors');
let bodyParser = require('body-parser');
let socket = require("socket.io");
const fs = require('fs');
// let sh=require('./socketHandle');
let rh=require('./roomHandle');

let app = express();

// let handleSynchronousClient = require('./handler');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

let server = http.createServer(app);
let socketServer = socket(server);
//房间数据
let roomList=[];
//匹配列表
let waitList=[];
//全卡数据
let cardList=[];

//加载卡片数据
fs.readFile('sg.json', 'utf8', (err, cardData) => {
    if (err) {
        console.error(err);
        return;
    }

    // let obj={o1:{o2:1,o3:2}};
    // let arr=[obj];
    // let o4=obj.o1;
    // arr.shift();
    // console.log(arr,"arr",o4)
    // console.log(cardData.length);
    cardList=JSON.parse(cardData)
    server.listen(4001, function () {
        console.log("listen");
    });
    
    socketServer.on('connection', function (socket) {
        console.log(socket.id,"connect one on ：" + new Date().toLocaleString());
        // console.log(socketServer===socket)
        // let socketHandle=new sh(socket);
        roomHandle=new rh(roomList,waitList,cardList,socketServer);
        socket.on('CONNECT',  (data) => {
            console.log("收到连接成功客户端身份验证",data);
            let inGame=false;
            let roomData=null;
            let gameHandle=null;
            //获取房间或游戏状态
            for(let i=0;i<roomList.length;i++){
                console.log("roomList>>",roomList[i].roomData.one.user,roomList[i].roomData.two.user)
                if(roomList[i].roomData.one.user==data.user||roomList[i].roomData.two.user==data.user){
                    console.log("游戏中 进入重连逻辑>>",data.user);
                    if(roomList[i].roomData.one.user==data.user){
                        console.log(socket.id,"socket是否相同",roomList[i].roomData.one.socket===socket);
                        roomList[i].roomData.one.socket=socket;
                    }
                    if(roomList[i].roomData.two.user==data.user){
                        console.log(socket.id,"socket是否相同",roomList[i].roomData.two.socket===socket);
                        roomList[i].roomData.two.socket=socket;
                    }
                    inGame=true;
                    roomData=roomList[i].roomData;
                    gameHandle=roomList[i].gameHandle;
                    break;
                }
            }
            if(inGame) {
                console.log("ingame>>>>",gameHandle==null,roomHandle.roomData==undefined);
                // let roomHandle=new rh(roomList,waitList,cardList,socketServer);
                if(roomHandle.roomData==undefined){
                    roomHandle.roomData=roomData;
                    // roomHandle.gameHandle=gameHandle;
                }
                gameHandle.sendData(data.user);//发送重连数据给前端
            }
        });    
        // socket.emit("CONNECT",{type:"connect"});
        
        socket.on('ROOM',  (data) => {
        // socket.on('ROOM',  function () {
            console.log(socket.id,"arguments>>",data);
            // let args = Array.prototype.slice.call(data);
            // args.push(socket);
            roomHandle.roomHandle(socket,data);
        });
        socket.on('GAME',  (data) => {
            // socket.on('ROOM',  function () 
            // let args = Array.prototype.slice.call(arguments);
            
            roomHandle.gameSocketHandle(socket,data);
            
        });
    
        
    
        socket.on('disconnect', function () {
            console.log("disconnect one on ：" + new Date().toLocaleString());
        });
    
        socket.on("ADD", function() {
            console.log("ADD>>",arguments);
            let args = Array.prototype.slice.call(arguments);
            // let roomNumber = existUserGameRoomMap[args.userId];
            // memoryData[roomNumber].count += 1;
            // memoryData[roomNumber]["one"].socket.emit("UPDATE", {
            //     count: memoryData[roomNumber].count
            // });
            // memoryData[roomNumber]["two"].socket.emit("UPDATE", {
            //     count: memoryData[roomNumber].count
            // });
        })
    
    });
}) 



