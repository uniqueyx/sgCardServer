
let GameHandle=require('./gameHandle');
// 定义room操作类
class RoomHandle {
    //构造函数
    constructor(roomList,waitList,cardData,socketServer) {
        // this.memoryData = {}; // 缓存的房间游戏数据，key => 房间号，value => 游戏数据
        this.roomList=roomList;
        this.waitList=waitList;
        this.cardData=cardData;
        console.log("this.cardData>>",this.cardData.length)
        this.socketServer=socketServer;
        // console.log(roomList,waitList);
        // console.log("args>>>",args)
    }
    //======类中函数
    //房间消息
    roomHandle(socket,data){
        console.log("roomHandle>>",this.roomList,data);
        // if(args.)
        switch (data.type) {
            case "match_room":
                this.matchRoom(socket,data);
                break;
            case "match_cancel":
                this.matchCancel(socket,data);
                break;
            // case "game_ready":
            //     this.gameReady(socket,data);
            //     break;    
            case "create":
                this.createRoom(socket,data);
                break;
            case "join":
                this.joinRoom(socket,data);
                break;
        }
    }
    
    gameSocketHandle(socket,data){
        console.log(this.roomData==undefined,"gameSocketHandle>>",data);
        let gameHandle=null;
        for(let i=0;i<this.roomList.length;i++){
            console.log("gameSocketHandle_user>>",this.roomList[i].roomData.one.user,this.roomList[i].roomData.two.user);
            console.log("socket id>>",this.roomList[i].roomData.one.socket.id,this.roomList[i].roomData.two.socket.id,socket.id)
            if(this.roomList[i].roomData.one.socket===socket||this.roomList[i].roomData.two.socket==socket){
                if(this.roomData==undefined)    this.roomData=this.roomList[i].roomData;
                gameHandle=this.roomList[i].gameHandle;
                // console.log("this.roomList[i].gameHandle>>",this.roomList[i].gameHandle)
                break;
            }
        }
        if(!gameHandle){
            console.log("bug===>>收到game消息没有找到对应的gameHandle");
            if(data.type== 'game_ready')    socket.emit("GAME",{type:"game_dissolve"});
            return;
        }
        gameHandle.gameHandle(socket,data);
    }    

    matchRoom(socket,data){
        console.log(this.waitList.length,"收到匹配房间",socket.id,data);
        if(this.waitList.length==0){
            console.log("向客户端发送匹配中",socket.id);
            this.waitList.push({user:data.user,socket:socket,ready:false});
	        socket.emit("ROOM",{type:"match_wait"});//匹配中
        }else{//进入匹配逻辑
            let gameOne=this.waitList[0];
            if(gameOne.user==data.user){
                console.log("已经在匹配中了",data.user);
                return;
            }
            this.roomData={roomId:gameOne.user,one:gameOne,two:{user:data.user,socket:socket,ready:false},turn:0};
            let gameHandle=new GameHandle(this.cardData,this.roomData,(rId)=>{this.gameOver(rId)});
            this.roomList.push( {roomData:this.roomData,gameHandle:gameHandle});
            // this.roomId=gameOne.user;
            //匹配成功 开始游戏消息
            // gameOne.socket.join(this.roomId);
            // data.socket.join(this.roomId);
            // this.socketServer.to(this.roomId).emit('room',{}); 
            this.waitList.shift();
            gameOne.socket.emit("ROOM",{type:"match_success"});
            socket.emit("ROOM",{type:"match_success"});
            //此处实例化gameHandle类
            // console.log("this.roomData>>",this.roomData)
            // =
            // let gameHandle=new GameHandle(this.cardData,this.roomData);
            // this.roomData.gameHandle=new GameHandle(this.cardData,this.roomData);
            console.log("匹配成功 等待ready 游戏初始化",this.roomList.length);
            gameHandle.readyGame();
            // gameHandle.initGame();
        }
    }
    matchCancel(socket,data){
        console.log(this.waitList.length,"收到匹配取消",socket.id,data);
        for(var i=0;i<this.waitList.length;i++){
        	let waitOne=this.waitList[i];
        	if(waitOne.user==data.user){
        		this.waitList.splice(i,1);
        		console.log(this.waitList.length,"取消匹配");
        		socket.emit("ROOM",{type:"match_cancel"});
        		break;
        	}
        }
	
   }
   disConnect(socket){
	console.log("玩家断开连接 处理自动取消匹配",socket.id)
	for(var i=0;i<this.waitList.length;i++){
	let waitOne=this.waitList[i];
	if(waitOne.socket==socket){
		this.waitList.splice(i,1);
		console.log(this.waitList.length,"取消匹配");
		socket.emit("ROOM",{type:"match_cancel"});
		break;
	}
        }
   }
    createRoom(socket,data){

    }
    joinRoom(socket,data){

    }
    
    //静态函数
    // static sayHello(name){
    //     //修改静态变量
    //     this.para = name;
    //     return 'Hello, ' + name;
    // }
    //=================方法函数
    //游戏结束处理 删除房间数据等
    gameOver(roomId){
        console.log("游戏结束  roomId",roomId);
        for(let i=0;i<this.roomList.length;i++){
            // console.log("gameSocketHandle_user>>",this.roomList[i].roomData.one.user,this.roomList[i].roomData.two.user);
            // console.log("socket id>>",this.roomList[i].roomData.one.socket.id,this.roomList[i].roomData.two.socket.id,socket.id)
            if(this.roomList[i].roomData.roomId==roomId){
                this.roomList.splice(i,1);
                 console.log("清除房间信息",this.roomList.length);
                break;
            }
        }
       
    }

    
}
//静态变量

// RoomHandle.TABLEMAGIC_LIMIT = 5;//魔法卡上限
module.exports = RoomHandle;