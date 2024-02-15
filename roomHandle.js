
let GameHandle=require('./gameHandle');
let AI=require('./ai');
let GameDB=require('./gameDB');
const createDBConnection=require('./db');
const SQL=require('./sql');
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
                this.queryMatch(socket,data);
                // this.matchRoom(socket,data);
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
            if(data.type== 'game_ready')    socket.emit("ERROR",{type:"game_error",msg:"游戏已结束！"});
            return;
        }
        gameHandle.gameHandle(socket,data);
    }    
    judgeInGame(user){
         for(let i=0;i<this.roomList.length;i++){
            // console.log("roomList>>",roomList[i].roomData.one.user,roomList[i].roomData.two.user)
            if(this.roomList[i].roomData.one.user==user||roomList[i].roomData.two.user==user){
                console.log("在游戏中 >>",this.roomList[i].roomData.roomId);
                return true;
                break;
            }
        }
         return false;   
    }
    //获取匹配等待的玩家
    getWaitPlayer(gameType){
        for(let i=0;i<this.waitList.length;i++){
            let waitOne=this.waitList[i];
            if(waitOne.gameType==gameType) return waitOne;
        }
        return null;
    }
    //移除匹配玩家
    removeWaitPlayer(user){
        for(let i=0;i<this.waitList.length;i++){
            let waitOne=this.waitList[i];
            if(waitOne.user==user) {
                this.waitList.splice(i,1);
                break;
            }    
        }
    }
    queryMatch(socket,data){
        let connection = new SQL();
        connection.query(`select info from card where user = ? and cardtype = ? and used = ?`, [data.user,data.gameType>1?2:1,1])
          .then((result) => {
            if(result.length>0){
                let info=JSON.parse(result[0].info);
                console.log("有对战卡组 处理后续");
                this.matchRoom(socket,data,info.selectedCards);
            }else{
                console.log("没有对战卡组",data.gameType);
                socket.emit("ROOM",{type:"match_error",gameType:data.gameType});
            }
          })
          .catch((err) => {
              // res.json({message:"数据库异常"});
            console.log('Error executing query:',err.errno);
          });
        
        // if(!this.connection) this.connection=createDBConnection();
        // this.connection.query(`select info from card where user = ? and cardtype = ? and used = ?`, [data.user,data.gameType,1], (err, result) => {
        //     console.log(result.length,"queryDB  result>>>",result[0]);
        //     //selectedCards
        //     if (err) {
        //         console.log("数据库异常");
        //         return;
        //     }
        //     if(result.length>0){
        //         let info=JSON.parse(result[0].info);
        //         // this.roomData[key].selectedCards=info.selectedCards;
        //         console.log("有对战卡组 处理后续");
        //         //处理 卡组设置    卡组详细列表滚动无效
        //         this.matchRoom(socket,data,info.selectedCards);
        //     }else{
        //         // this.roomData[key].selectedCards=[];
        //         console.log("没有对战卡组",data.gameType);
        //         socket.emit("ROOM",{type:"match_error",gameType:data.gameType});
        //     }
        // })
        // console.log("await  res",res)
    }
    matchRoom(socket,data,selectedCards){
        console.log(this.waitList.length,"收到匹配房间",socket.id,data);
        // let res=this.queryDB(data.user,data.gameType);
        let obj={user:data.user,selectedCards:selectedCards,gameType:data.gameType,socket:socket,ready:false}
        let gameOne=this.getWaitPlayer(data.gameType);
        if(gameOne==null){
        // if(this.waitList.length==0){
            console.log("向客户端发送匹配中",socket.id);
            let dt=0;
            if(data.gameType==3)    {
                
            }else{
                this.waitList.push(obj);
                dt=3000+Math.random()*5000;
            }    
	        socket.emit("ROOM",{type:"match_wait"});//匹配中
            this.aiTimer=setTimeout(() => {//新功能逻辑
                console.log("匹配等待时间到 自动加入ai");
                if(!this.judgeInGame(data.user)){
                    let userData=GameDB.USER_DB.get(data.user);
                    let ai=new AI(data.gameType,userData.level);
                    let aiObj={user:ai.uid,selectedCards:ai.selectedCards,gameType:data.gameType,socket:ai,isAI:1,ready:false}
                    this.roomData={roomId:data.user,one:obj,two:aiObj,turn:0};
                    let gameHandle=new GameHandle(this.cardData,this.roomData,(rId)=>{this.gameOver(rId)});
                    ai.gameHandle=gameHandle;//操作类赋值 游戏结束记得清除引用
                    this.roomList.push({roomData:this.roomData,gameHandle:gameHandle});
                    this.removeWaitPlayer(data.user);
                    gameHandle.readyGame();
                    socket.emit("ROOM",{type:"match_success"});
                    ai.emit("ROOM",{type:"match_success"});
                    console.log("匹配ai成功 等待ready 游戏初始化",this.roomList.length);
                }
            }, dt);
        }else{//进入匹配逻辑
            console.log("找到对手进入匹配逻辑");
            if(gameOne.user==data.user){
                console.log("已经在匹配中了",data.user);
                return;
            }
            clearTimeout(this.aiTimer);//清除自动加入ai
            this.roomData={roomId:gameOne.user,one:gameOne,two:obj,turn:0};
            let gameHandle=new GameHandle(this.cardData,this.roomData,(rId)=>{this.gameOver(rId)});
            this.roomList.push( {roomData:this.roomData,gameHandle:gameHandle});
            this.removeWaitPlayer(gameOne.user);
            gameHandle.readyGame();
            gameOne.socket.emit("ROOM",{type:"match_success"});
            socket.emit("ROOM",{type:"match_success"});
            console.log("匹配成功 等待ready 游戏初始化",this.roomList.length);
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
                clearTimeout(this.aiTimer);//清除自动加入ai
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
                clearTimeout(this.aiTimer);//清除自动加入ai
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
        console.log("游戏结束  roomId",roomId,"房间数",this.roomList.length);
        for(let i=0;i<this.roomList.length;i++){
            // console.log("gameSocketHandle_user>>",this.roomList[i].roomData.one.user,this.roomList[i].roomData.two.user);
            // console.log("socket id>>",this.roomList[i].roomData.one.socket.id,this.roomList[i].roomData.two.socket.id,socket.id)
            if(this.roomList[i].roomData.roomId==roomId){
                if(this.roomList[i].roomData.two.isAI){
                    this.roomList[i].roomData.two.socket.gameHandle=null;//清除机器人的gamehandle引用
                }
                this.roomList.splice(i,1);
                 console.log("清除完房间信息 房间数",this.roomList.length);
                break;
            }
        }
       
    }

    
}
//静态变量

// RoomHandle.TABLEMAGIC_LIMIT = 5;//魔法卡上限
module.exports = RoomHandle;