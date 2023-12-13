
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
            case "match":
                this.matchRoom(socket,data);
                break;
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
            return;
        }
        gameHandle.gameHandle(socket,data);
    }    

    matchRoom(socket,data){
        console.log(this.waitList.length,"收到匹配房间",socket.id,data);
        if(this.waitList.length==0){
            this.waitList.push({user:data.user,socket:socket});
        }else{//进入匹配逻辑
            let gameOne=this.waitList[0];
            this.roomData={roomId:gameOne.user,one:gameOne,two:{user:data.user,socket:socket},turn:0};
            let gameHandle=new GameHandle(this.cardData,this.roomData);
            this.roomList.push( {roomData:this.roomData,gameHandle:gameHandle});
            // this.roomId=gameOne.user;
            //匹配成功 开始游戏消息
            // gameOne.socket.join(this.roomId);
            // data.socket.join(this.roomId);
            // this.socketServer.to(this.roomId).emit('room',{}); 

            gameOne.socket.emit("ROOM",{type:"match_success"});
            socket.emit("ROOM",{type:"match_success"});
            //此处实例化gameHandle类
            // console.log("this.roomData>>",this.roomData)
            // =
            // let gameHandle=new GameHandle(this.cardData,this.roomData);
            // this.roomData.gameHandle=new GameHandle(this.cardData,this.roomData);
            gameHandle.initGame();
            // this.initGame();
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

    
}
//静态变量

// RoomHandle.TABLEMAGIC_LIMIT = 5;//魔法卡上限
module.exports = RoomHandle;