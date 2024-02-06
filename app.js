let http = require('http');
let express = require('express');
let cors = require('cors');
let bodyParser = require('body-parser');
let socket = require("socket.io");
const fs = require('fs');
let GameDB=require('./gameDB');
const createDBConnection=require('./db');
const SQL=require('./sql');
// let sh=require('./socketHandle');
let rh=require('./roomHandle');
let Arena=require('./arena');//竞技场
let CardEdit=require('./cardEdit');//卡组编辑

let app = express();

// let handleSynchronousClient = require('./handler');

//app.use(cors({origin:'*'}));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//数据库连接
// const connection = createDBConnection();

let server = http.createServer(app);
//let socketServer = socket(server);
let socketServer = socket(server,{cors:{origin:'*'}});
//房间数据
let roomList=[];
//匹配列表
let waitList=[];
//全卡数据
let cardList=[];
//在线socket列表
let onLineList=new Map();
//竞技数据
let arena=new Arena();
//卡组编辑
let cardEdit=new CardEdit();

initSocket=()=>{
    console.log("initSocket");
}
getDbUser=(uid,callback)=>{
    let connection = new SQL();
    console.log("getDbUser",uid);
    connection.query(`select * from user where uid = ?`, [uid])
      .then((result) => {
        if(result.length>0){
            console.log("result[0]>>",result[0]);
            GameDB.USER_DB.set(result[0].uid,result[0]);
            callback(result);
        }else console.log("没有玩家数据？？？？？");
      })
      .catch((err) => {
          // res.json({message:"数据库异常"});
        console.log('Error executing query:',err.errno);
      });

    // connection.query(`select * from user where uid = ?`, [uid], (err, result) => {
    //     if (err) {
    //       console.log("数据库异常")
    //       return;
    //     }
    //     if(result.length>0){
    //         console.log("result[0]>>",result[0]);
    //         GameDB.USER_DB.set(result[0].uid,result[0]);
    //         callback(result);
    //     }else console.log("没有玩家数据？？？？？");;
    // });    
}

initUserConnect=(socket,roomHandle,data)=>{
    console.log("initUserConnect处理连接 重连  roomlist长度",roomList.length);
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
                console.log("ingame>>>> 发送重连数据？？",gameHandle==null,roomHandle.roomData==undefined);
                // let roomHandle=new rh(roomList,waitList,cardList,socketServer);
                if(roomHandle.roomData==undefined){
                    roomHandle.roomData=roomData;
                    // roomHandle.gameHandle=gameHandle;
                }
                //通知客户端 在游戏中
                socket.emit("GAME",{type:"game_return"});//,turn:this.roomData.turn
                // gameHandle.sendData(data.user);//发送重连数据给前端
            }
}


//加载卡片数据
fs.readFile('sg.json', 'utf8', (err, cardData) => {
    if (err) {
        console.error(err);
        return;
    }
    // this.test1();
    // let obj={o1:{o2:1,o3:2}};
    // let arr=[obj];
    // let o4=obj.o1;
    // arr.shift();
    // console.log(arr,"arr",o4)
    // console.log(cardData.length);
    cardList=JSON.parse(cardData);
    GameDB.CARDLIST=cardList;
    server.listen(3005, function () {
        console.log("listen 3005");
    });
    
    socketServer.on('connection', function (socket) {
        console.log(socket.id,"connect one on ：" + new Date().toLocaleString());
        // console.log(socketServer===socket)
        // let socketHandle=new sh(socket);
        let roomHandle=new rh(roomList,waitList,cardList,socketServer);
        socket.on('CONNECT',  (data) => {
            console.log(roomList.length,"roomList收到连接成功客户端身份验证",data);
            //判断重复登录
            let userSocket=onLineList.get(data.user);
            if(userSocket){
                console.log("处理重复登录",userSocket.id);
                // userSocket.emit("GAME",{type:"game_return"});
                userSocket.emit("LOGIN",{type:"login_repeat"});
            }
            onLineList.set(data.user,socket);
            console.log("在线数",onLineList.size,socket.id);
            //处理判断重连进游戏
            getDbUser(data.user,(result) => {
                // console.log(result); // 在这里处理查询结果
                initUserConnect(socket,roomHandle,data);
            });
            
            
            // let inGame=false;
            // let roomData=null;
            // let gameHandle=null;
            // //获取房间或游戏状态
            // for(let i=0;i<roomList.length;i++){
            //     console.log("roomList>>",roomList[i].roomData.one.user,roomList[i].roomData.two.user)
            //     if(roomList[i].roomData.one.user==data.user||roomList[i].roomData.two.user==data.user){
            //         console.log("游戏中 进入重连逻辑>>",data.user);
            //         if(roomList[i].roomData.one.user==data.user){
            //             console.log(socket.id,"socket是否相同",roomList[i].roomData.one.socket===socket);
            //             roomList[i].roomData.one.socket=socket;
            //         }
            //         if(roomList[i].roomData.two.user==data.user){
            //             console.log(socket.id,"socket是否相同",roomList[i].roomData.two.socket===socket);
            //             roomList[i].roomData.two.socket=socket;
            //         }
            //         inGame=true;
            //         roomData=roomList[i].roomData;
            //         gameHandle=roomList[i].gameHandle;
            //         break;
            //     }
            // }
            // if(inGame) {
            //     console.log("ingame>>>> 发送重连数据？？",gameHandle==null,roomHandle.roomData==undefined);
            //     if(roomHandle.roomData==undefined){
            //         roomHandle.roomData=roomData;
            //     }
            //     gameHandle.sendData(data.user);//发送重连数据给前端
            // }
        });    
        // socket.emit("CONNECT",{type:"connect"});
        //房间信息
        socket.on('ROOM',  (data) => {
        // socket.on('ROOM',  function () {
            console.log(socket.id,"arguments>>",data);
            // let args = Array.prototype.slice.call(data);
            // args.push(socket);
            roomHandle.roomHandle(socket,data);
        });
        //游戏信息
        socket.on('GAME',  (data) => {
            // socket.on('ROOM',  function () 
            // let args = Array.prototype.slice.call(arguments);
            
            roomHandle.gameSocketHandle(socket,data);
            
        });
        //竞技信息
        socket.on('ARENA',  (data) => {
            console.log(socket.id,"竞技arguments>>",data);
            arena.arenaHandle(socket,data);
        });
        //卡组编辑
        socket.on('CARD',  (data) => {
            console.log(socket.id,"卡组编辑arguments>>",data);
            cardEdit.cardEditHandle(socket,data);
        });
    	
        socket.on('disconnect',  (data) => {
            console.log("disconnect one on ：" + new Date().toLocaleString(),"断开连接",data);
	        roomHandle.disConnect(socket);
            onLineList.forEach((value, key) => {
                if(socket.id===value.id){
                    onLineList.delete(key);
                }
            });
            console.log("在线数",onLineList.size);
        });
        //socket.on('disconnect', function () {
        //    console.log("disconnect one on ：" + new Date().toLocaleString());
        //});
    
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



