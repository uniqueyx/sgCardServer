let Card=require('./card');
let GameDB=require('./gameDB');
const SQL=require('./sql');
const createDBConnection=require('./db');
// 定义游戏玩家操作类    一个房间内的两个玩家共用一个gamehandle类
class GameHandle {
    //构造函数
    constructor(cardData,roomData,gameOverCall) {
        this.cardData=cardData;
        this.roomData=roomData;
        // this.socket=socket;
        // console.log(socket.id);
        // console.log("args>>>",args)
        this.gameType=this.roomData.two.gameType;//游戏类型
        this.gameOverCall=gameOverCall;
        this.gameState=0;
    }
    //类中函数
    //步骤加1 用于给客户端 做卡牌延迟展示效果 
    addStep(){
        this.stepCount++;
    }

    //游戏准备
    readyGame(){
        this.gameState=1;
        
    }

    //初始化游戏  回合开始 回合结束
    initGame(){
        this.gameState=2;
        console.log(this.roomData.roomId,"游戏初始化");
        this.stepCount=0;
        
        //随机出先攻 开始回合
        let first=Math.random() * 2;//Math.floor(Math.random() * 2);
        this.roomData.firstTurn=first<1?"one":"two";
        console.log("firstTurn>>>",this.roomData.firstTurn);

        //发送开始游戏  GameDB.USER_DB.get   nick undefined报错 要查一下
        let nick=this.roomData.two.isAI?this.roomData.two.socket.nick:GameDB.USER_DB.get(this.roomData.two.user).nick;
        this.roomData.one.socket.emit("GAME",{type:"game_start",otherName:nick,first:this.roomData.firstTurn=="one",gameState:this.gameState,gameType:this.gameType});
        this.roomData.two.socket.emit("GAME",{type:"game_start",otherName:GameDB.USER_DB.get(this.roomData.one.user).nick,first:this.roomData.firstTurn=="two",gameState:this.gameState,gameType:this.gameType});
        

        //初始化士气
        this.roomData.orderCount=0;
        this.initHP();
        
        //初始化卡组
        this.initCards("one");
        this.initCards("two");
        //初始化攻击次数
        this.initAttackCount("one");
        this.initAttackCount("two");
       
        //发送卡牌数据
        this.socketSendCards( this.roomData.one,this.roomData.two);
        this.socketSendCards( this.roomData.two,this.roomData.one);

        //换牌阶段
        this.roomData.one.changeHand=false;
        this.roomData.two.changeHand=false;
        this.changeHandTimer=setTimeout(() => {
            console.log("换牌操作时间到 自动开始回合");
            this.roomData.one.changeHand=true;
            this.roomData.two.changeHand=true;
            this.gameState=3;
            this.turnStart();
        }, 30000); 
        //回合计时器
        // this.initTurnTimer();
        // this.turnNext(false);
        
    }
    //回合开始 游戏正式开始计时
    turnStart(){
        //回合计时器
        //2秒后执行
        setTimeout(() => {
            this.initTurnTimer();
            this.turnNext(false);
        }, 2000); 
        // this.initTurnTimer();
        // this.turnNext(false);
    }
    //初始化士气
    initHP(){
        this.roomData["one"].hp=GameHandle.INIT_HP;
        this.roomData["two"].hp=this.gameType==3?GameHandle.INIT_HP_DUNGEON:GameHandle.INIT_HP;//
    }
    //重置武将通常召唤次数  重置攻击次数
    initUseGeneralTimes(){
        this.roomData["one"].useGeneralTimes=1;
        this.roomData["two"].useGeneralTimes=1;
        this.initAttackCount();//初始化攻击次数
    }
    //重置攻击次数
    initAttackCount(key=""){
        let cardList=this.roomData[key?key:this.currentTurn]["tableCards"];
        for(let i=0;i<cardList.length;i++){
            let cardOne=cardList[i];
            cardOne.initAttackCount();
        }
    }
    //初始化卡组
    initCards(key){
        let cardList=[];
        // let cardList=[10001,10001,10001,10001,10001,10001,10002,10002,10002,10002,10002,10002,
        //     10003,10003,10003,10003,10003,10003,
        //     10004,10004,10004,10004,10004,10004,10005,10005,10005,10005,10005,10005];
        if(this.roomData[key].selectedCards.length){
            cardList=this.roomData[key].selectedCards;
            console.log(key,"自选卡组","cardList>>",cardList);
        }else{//随机测试卡组
            let arrRare=[10009,10010,10209,10210,10309,10310,20105,20205,20305,20002,20006]
            let ran1=Math.floor(Math.random()*4)+1;
            // ran1=4;
            let num=10;
            let numMagic=5;
            let repeat=2;
            let jKey=10001+100*ran1;
            let mKey=20001+100*ran1;
            for(let i=0;i<num;i++){
                for(let j=0;j<repeat;j++){
                    if(arrRare.indexOf(jKey+i)!=-1&&cardList.indexOf(jKey+i)!=-1) continue;
                    cardList.push(jKey+i);
                }
            }
            for(let i=0;i<numMagic;i++){
                for(let j=0;j<repeat;j++){
                    if(arrRare.indexOf(mKey+i)!=-1&&cardList.indexOf(mKey+i)!=-1) continue;
                    cardList.push(mKey+i);
                }
            }
            cardList.push(21002,21009,21010,21011,30001,30002,30003,30104,30105,30106,30107,30109);//天崩地裂 破咒结界
            for(let i=0;i<9;i++){
                // cardList.push(30101+i);
                // cardList.push(30109);
            }
            // cardList.push(10013,10013,10013,10013,10013,10013,10013,10013);
            // cardList.push(10013,10013,10013,10013,10013,10013,10013,10013);
            // cardList=[10209,10209,10209,10209,10209,21009,21009,21009,21009,21009];
            console.log(key,"测试卡组","cardList>>",cardList)
        }
        this.shuffle(cardList);//洗牌
            let newList=[];    
        for(let j=0;j<cardList.length;j++){
            for(let i=0;i<this.cardData.length;i++){
                let cardOne=this.cardData[i];
                if(cardList[j]==cardOne.id){
                    let newCard=new Card(cardOne);
                    newCard.updateOwner(key);
                    newList.push(newCard);
                }
            }
        }
        
        // console.log(this.cardData.length,"newList>>",newList)
        this.roomData[key].handCards=newList.splice(0,GameHandle.HANDCARD_COUNT);
        this.roomData[key].tableCards=[];
        this.roomData[key].magicCards=[];
        this.roomData[key].remainCards=newList;
        this.roomData[key].usedCards=[];//本局对战使用过的卡
    }
    //获取当前卡牌数据
    getCurrentCardData(player,other){
        let arrHand=[];
        for(let i=0;i<player.handCards.length;i++){
            arrHand.push(player.handCards[i].getCardData());
        }
        let arrTable=[];
        for(let i=0;i<player.tableCards.length;i++){
            arrTable.push(player.tableCards[i].getCardData());
        }
        let arrMagic=[];
        for(let i=0;i<player.magicCards.length;i++){
            arrMagic.push(player.magicCards[i].getCardData());
        }
        let arrOtherHand=[];
        for(let i=0;i<other.handCards.length;i++){
            // arrOtherHand.push(0);
            arrOtherHand.push(other.handCards[i].getCardData(true));
        }
        let arrOtherTable=[];
        for(let i=0;i<other.tableCards.length;i++){
            arrOtherTable.push(other.tableCards[i].getCardData());
        }
        let arrOtherMagic=[];
        for(let i=0;i<other.magicCards.length;i++){
            arrOtherMagic.push(other.magicCards[i].getCardData(true));
        }
        return {type:"card_info",handCards:arrHand,tableCards:arrTable,magicCards:arrMagic,otherTableCards:arrOtherTable,otherMagicCards:arrOtherMagic,remainCards:player.remainCards.length,otherHandCards:arrOtherHand,otherRemainCards:other.remainCards.length};
    }
    //发送卡牌数据给客户端
    socketSendCards(player,other){

        player.socket.emit("GAME",this.getCurrentCardData(player,other));
    }
    //发送开始攻击消息
    socketCardAttack(key,uid,target){
        let other=key=="one"?"two":"one";
        this.roomData[key].socket.emit("GAME",{type:"card_attack",isMe:true,uid:uid,target:target});
        this.roomData[other].socket.emit("GAME",{type:"card_attack",isMe:false,uid:uid,target:target});
    }
    //更新单个卡牌信息 暂时只处理场上 pos获得专用参数4从系统 3从卡组 updateType(3 2 1 0 -1 -2 -3 -4 -5) 1召唤武将 2获得 3放置陷阱 0 -1破坏 -2返回手卡 -3返回卡组 -4陷阱卡发动 -5守护 
    socketUpdateCard(key,uid,updateType,card,pos=0){
        console.log(updateType,"发送单个卡牌socketupdate_card>>",key,uid,card.cardName);
        let other=key=="one"?"two":"one";
        this.roomData[key].socket.emit("GAME",{type:"card_update",isMe:true,uid:uid,updateType:updateType,value:(updateType==-1||updateType==1||updateType==2||updateType==3||updateType==-4)?card.getCardData():0,pos:pos});
        this.roomData[other].socket.emit("GAME",{type:"card_update",isMe:false,uid:uid,updateType:updateType,value:(updateType==-1||updateType==1||updateType==2||updateType==3||updateType==-4)?card.getCardData(updateType==3):0,pos:pos});
    }
    //更新场上武将卡buff  updateType(1 0 -1)增加 更新 移除
    socketUpdateBuff(key,uid,buffUid,buffId,type,value){
        buffId=parseInt(buffId);
        value=parseInt(value);
        let other=key=="one"?"two":"one";
        this.roomData[key].socket.emit("GAME",{type:"buff_update",isMe:true,uid:uid,buffUid:buffUid,buffId:buffId,updateType:type,value:value});
        this.roomData[other].socket.emit("GAME",{type:"buff_update",isMe:false,uid:uid,buffUid:buffUid,buffId:buffId,updateType:type,value:value});
    }
    //更新士气
    socketUpdateHP(key,hp){
        let other=key=="one"?"two":"one";
        this.roomData[key].socket.emit("GAME",{type:"hp_update",hp:hp,isMe:true});
        this.roomData[other].socket.emit("GAME",{type:"hp_update",hp:hp,isMe:false});
    }
    //================游戏消息
    gameHandle(socket,data){
        console.log("gameHandle>>",data);
        if(data.type=="game_ready"){//游戏准备消息特殊处理 还没进入回合判断
            this.gameReady(socket,data);
            return;
        }
        if(data.type=="game_surrender"){//游戏投降消息特殊处理 不用进入回合判断
            this.gameSurrender(socket,data);
            return;
        }
        if(data.type=="game_changeHand"){//更换手牌 不用进入回合判断
            this.gameChangeHand(socket,data);
            return;
        }
        if(!this.roomData[this.currentTurn]){
            console.log("socket不存在>>>")
            return;
        }
        if(this.roomData[this.currentTurn].socket!==socket){
            console.log("操作错误 非当前回合玩家 无法操作",data.type)
            return;
        }
        switch (data.type) {
            case "turn_end":
                this.turnEnd(socket,data);
                break;
            // case "game_surrender":
            //     this.gameSurrender(socket,data);
                break;
            case "card_use":
                this.cardUse(socket,data);
                break;
            case "card_attack":
                this.cardAttack(socket,data);
                break;
        }
    }
    gameReady(socket,data){
         console.log(this.gameState,"收到玩家准备 ",data);
         if(this.gameState!=1) {
            console.log("玩家重连进入  需要发送游戏数据");
            this.sendData(data.user);
            return;
        }    
        //   console.log("收到玩家准备1 ");
         if(this.roomData.one.user==data.user){
            if(this.roomData.one.ready) return;
            this.roomData.one.ready=true;
         }else if(this.roomData.two.user==data.user){
            if(this.roomData.two.ready) return;
            this.roomData.two.ready=true;
         }
         if(!this.readyTimer){
            console.log("触发20秒准备倒计时");
            this.readyTimer=setTimeout(() => {
                console.log("有玩家没有准备 超时 自动结束游戏");
                this.roomData["one"].socket.emit("GAME",{type:"game_dissolve"});
                this.roomData["two"].socket.emit("GAME",{type:"game_dissolve"});
                console.log("gameOverCall 回调处理");
                this.gameOverCall(this.roomData.roomId);
            }, 20000); 
        } 
        if(this.roomData.one.ready&&this.roomData.two.ready){
            console.log("双方玩家准备完毕 开始游戏initGame");
            clearTimeout(this.readyTimer);
            // this.getUserCard(this.roomData.one.user,this.roomData.two.user);
            this.initGame();//游戏开始
            // this.getUserCard("one",this.roomData.one.user);
            // this.getUserCard("two",this.roomData.two.user);
        }
    }
    //获取数据库玩家卡牌信息  暂时已弃用
    // getUserCard(key,user){
    //     if(!this.connection){
    //         this.connection=createDBConnection();
    //     }
    //     this.connection.query(`select info from card where user = ? and cardtype = ?`, [user,1], (err, result) => {
    //         console.log(result.length,"result>>>",result[0]);
    //         //selectedCards
    //         if (err) {
    //             console.log("数据库异常");
    //             return;
    //         }
    //         if(result.length>0){
    //             let info=JSON.parse(result[0].info);
    //             this.roomData[key].selectedCards=info.selectedCards;
    //         }else{
    //             this.roomData[key].selectedCards=[];
    //         }
    //         console.log(this.roomData.one.selectedCards,this.roomData.two.selectedCards)
    //         console.log("true",this.roomData.one.selectedCards==true,this.roomData.two.selectedCards==true)
    //         if(this.roomData.one.selectedCards&&this.roomData.two.selectedCards){
    //             this.initGame();//游戏开始   !=undefined
    //         }
    //     }) 
    // }

    gameChangeHand(socket,data){
        console.log("收到更换手牌",this.gameState);
        if(this.gameState!=2) return;
        if(this.roomData.one.user==data.user){
            if(this.roomData.one.changeHand) return;
            this.roomData.one.changeHand=true;
            this.changeHandCard("one",data.cardList);
         }else if(this.roomData.two.user==data.user){
            if(this.roomData.two.changeHand) return;
            this.roomData.two.changeHand=true;
            this.changeHandCard("two",data.cardList);
         }
        if(this.roomData.one.changeHand&&this.roomData.two.changeHand){
            console.log("双方更换手牌完毕 开始游戏回合turn");
            clearTimeout(this.changeHandTimer);
            this.gameState=3;
            this.turnStart();
        }

    }
    changeHandCard(key,cardList){
        // console.log("更换手牌前",this.roomData[key].handCards);
        let other=key=="one"?"two":"one";
        for(let i=0;i<cardList.length;i++){
            if(cardList[i]==0){
                continue;
            }
            let card=this.getCardByUID(cardList[i],key,"handCards");
            this.insertRandom(this.roomData[key].remainCards,card);
            // this.removeCard(key,cardList[i],"handCards");
            let cardNew=this.roomData[key].remainCards.shift();
            // this.roomData[key].handCards.push(cardNew);
            this.roomData[key].handCards.splice(i, 1, cardNew); 
        }
        // console.log("更换手牌后",this.roomData[key].handCards);

        //this.insertRandom(this.roomData[arrCardOne.owner].remainCards,arrCardOne);
        let arrHand=[];
        for(let i=0;i<this.roomData[key].handCards.length;i++){
            arrHand.push(this.roomData[key].handCards[i].getCardData());
        }
        this.roomData[key].socket.emit("GAME",{type:"card_changeHand",isMe:true,newList:arrHand,cardList:cardList});
        this.roomData[other].socket.emit("GAME",{type:"card_changeHand",isMe:false,newList:arrHand,cardList:cardList});
    }
    turnEnd(socket,data){
        console.log("收到回合结束！",this.roomData.one.socket===socket,this.roomData.two.socket===socket);
        //判断回合结束消息是否正确
        // let currentTurn=(this.roomData.turn&1)?this.roomData.firstTurn:(this.roomData.firstTurn=="one"?"two":"one");
        // console.log(currentTurn,"turnEnd>>",this.roomData.turn,"socket判断",this.roomData[currentTurn].socket===socket);
        // if(this.roomData[currentTurn].socket!==socket){
        //     console.log("操作错误 非当前回合玩家 无法结束回合")
        //     return;
        // }
        //处理回合结束逻辑
        this.initTurnTimer();
        this.turnNext(true);

    }
    gameSurrender(socket,data){
        console.log("收到玩家投降 发送投降消息");
        let win=this.roomData.one.user==data.user?"two":"one";
        this.gameOver(win,3);

    }
    //初始化回合计时器
    initTurnTimer(){
        if(this.turnTimer) clearInterval(this.turnTimer);
        this.turnTimer=setInterval(() => {
            this.roomData.turnTime--;
            if(this.roomData.turnTime<=0){
                console.log("回合操作时间到 自动结束回合");
                this.turnNext(true);
            }
        }, 1000); 
    }
    //回合结束逻辑 下一回合
    turnNext(canDraw){
        this.roomData.turnTime=GameHandle.TURN_TIME;//回合时间重置
        this.roomData.turn++;
        let currentTurn=(this.roomData.turn&1)?this.roomData.firstTurn:(this.roomData.firstTurn=="one"?"two":"one");
        this.currentTurn=currentTurn;
        let other=currentTurn=="one"?"two":"one";
        //处理回合开始逻辑
        console.log(currentTurn,"回合开始",this.roomData.turn);
        this.roomData[currentTurn].socket.emit("GAME",{type:"turn_start",myTurn:true});
        this.roomData[other].socket.emit("GAME",{type:"turn_start",myTurn:false});
        //重置通招次数
        this.initUseGeneralTimes();
        //抽卡
        if(canDraw){
            
            this.drawCard(currentTurn);
        }
        
    }
    //游戏结束逻辑 胜负 winType胜利类型 1hp归0 2无卡 3投降  draw平局   
    gameOver(win,winType=1,draw=false){
        clearInterval(this.turnTimer);
        let lose=win=="one"?"two":"one";
        this.roomData[win].socket.emit("GAME",{type:"game_over",winType:winType,result:draw?-1:1});
        this.roomData[lose].socket.emit("GAME",{type:"game_over",winType:winType,result:draw?-1:0});
        // clearInterval(this.turnTimer);
        console.log("gameOverCall 回调处理");
        // if(this.roomData.two.isAI) 数据库处理
        this.gameOverCall(this.roomData.roomId);
        //数据库相关处理
        let connection = new SQL();
        if(this.roomData.two.gameType==3){//剧情挑战
            if(win=="one"){
                let userData=GameDB.USER_DB.get(this.roomData["one"].user);
                let nextLevel=this.roomData.two.socket.getNextLevel();
                console.log("nextLevel>>",nextLevel)
                connection.query(`update user set level= ? where uid= ?`, [nextLevel,this.roomData.one.user])
                  .then((result) => {
                        console.log("level更新成功",nextLevel);
                        // socket.emit("USER",{type:"user_update",level:data.id});
                        // GameDB.USER_DB.set(result[0].uid,result[0]);
                  })
                  .catch((err) => {
                      // res.json({message:"数据库异常"});
                    console.log('Error executing query:',err.errno);
                  });
            }
        }
        
    }
    //抽牌逻辑
    drawCard(currentTurn){
        // let currentTurn=this.currentTurn;
        //陷阱卡判断
        let isTrap=this.checkTrap(1003,currentTurn);
        //判断是否有卡没有则失败
        let other=currentTurn=="one"?"two":"one";
        if(this.roomData[currentTurn].remainCards.length==0){
            console.log("没卡了失败");
            this.gameOver(other,2);
            return null;
        }
        
        let card=this.roomData[currentTurn].remainCards.shift();
        let overflow=0;//满出的手牌id
        if(this.roomData[currentTurn].handCards.length==GameHandle.HANDCARD_LIMIT){
            overflow=card.id;
        }
        else{
            this.roomData[currentTurn].handCards.push(card);
        }    
        console.log(this.roomData[currentTurn].remainCards.length,overflow,"抽牌》",card.id,card.cardName);
        this.roomData[currentTurn].socket.emit("GAME",{type:"draw",id:card.id,uid:card.uid,overflow:overflow});
        this.roomData[other].socket.emit("GAME",{type:"draw_other",overflow:overflow,uid:card.uid});
        return card;
    }
    //================卡牌使用》》》
    cardUse(socket,data){
        // let card=this.roomData[this.currentTurn].handCards[data.index];
        let card=this.getCardByUID(data.uid,this.currentTurn,"handCards");
        console.log(data.index,"手卡数",this.roomData[this.currentTurn].handCards.length,"使用卡牌",card.cardName);
        // if(this.getTableCardByType(this.currentTurn,card.cardType)==(card.cardType==1?GameHandle.TABLEGENERAL_LIMIT:GameHandle.TABLEMAGIC_LIMIT)){
        //     console.log(card.cardType,"桌面卡牌满了 无法使用",card);
        //     return;
        // }
        // if(card.cardName=="破咒结界"){
        //     console.log("使用破咒结界buffone>>",this.roomData["one"]["tableCards"]);
        //     console.log("使用破咒结界bufftwo>>",this.roomData["two"]["tableCards"]);
        // }
        
        if(!card){
            console.log("cardUse卡牌没找到 return");
            return;
        }
        if(card.cardType==1&&this.roomData[this.currentTurn].tableCards.length==GameHandle.TABLEGENERAL_LIMIT){
            console.log(card.cardType,"桌面武将卡牌满了 无法使用",card.cardName);
            return;
        }
        if(card.cardType>1&&this.roomData[this.currentTurn].magicCards.length==GameHandle.TABLEMAGIC_LIMIT){
            console.log(card.cardType,"魔法陷阱卡区域满了 无法使用",card.cardName);
            return;
        }
        //判断卡牌特殊召唤条件
        // console.log("判断 特招条件",card.need);
        let useType=0;
        if(card.cardType==1){
            let judgeNeedResult=this.judgeCardNeed(card);
            if(judgeNeedResult==-1){
                console.log(card.cardType,"特招条件不满足 是否有BUG》》》》》》》》》》》》》》》》》》》》",card.cardName);
                return;
            }
            else if(judgeNeedResult==0)  {
                if(this.roomData[this.currentTurn].useGeneralTimes==0){
                    console.log(card.cardType,"通常召唤次数不足 是否有BUG》》》》》》》》》》》》》》》》》》》》",card.cardName);
                    return;
                }
                console.log("通招成功>>>",card.cardName)
                this.roomData[this.currentTurn].useGeneralTimes--;
                useType=1;
            }else{
                console.log("特招成功>>>》》》》》》",card.cardName)
                useType=2;
            }  
        }
        if(card.cardType==3) {
            useType=3;
            if(this.getCardByID(card.id,card.owner,"magicCards").length>0){
                console.log("<<<<<<<<<<<<<<<<<<<<存在同名陷阱卡了")
                return;
            }
        }    
          
        //告诉客户端使用卡牌成功
        let other=this.currentTurn=="one"?"two":"one";
        this.roomData[this.currentTurn].socket.emit("GAME",{type:"card_used",isMe:true,uid:data.uid,index:data.index,id:card.id,useType:useType});
        this.roomData[other].socket.emit("GAME",{type:"card_used",isMe:false,uid:data.uid,index:data.index,id:card.cardType==3?0:card.id,useType:useType});
        //
        //处理使用效果
        // let useCard=this.roomData[this.currentTurn].handCards.splice(data.index,1)[0];
        let useCard=this.getRemoveCard(this.currentTurn,"handCards",data.uid);
        //陷阱触发判断  判断卡牌反制
        let isTrap=this.checkTrap(1010+card.cardType,card.owner);
        if(isTrap){
            console.log("卡牌反制成功 使用失败");
            return;
        }
        //进入卡牌使用逻辑处理
        if(useCard.cardType==1) this.useGeneralCard(useCard);
        if(useCard.cardType>1) this.useMagicCard(useCard);
        // this.roomData[this.currentTurn].tableCards.push(useCard);
        this.updateCardBuff();
    }
    //使用魔法卡 陷阱卡
    useMagicCard(useCard){
        console.log(useCard.cardType,useCard.cardName,useCard.id,"使用魔法卡",useCard.effect);
        this.roomData.orderCount++;
        useCard.addOrder(this.roomData.orderCount);//登场顺序
        // this.socketUpdateCard(this.currentTurn,useCard.uid,1,useCard);//召唤武将
        if(useCard.cardType==3) {
            this.socketUpdateCard(this.currentTurn,useCard.uid,3,useCard);
            this.roomData[this.currentTurn].magicCards.push(useCard);//卡加入桌面魔法卡组
        }
        //处理战吼   魔法卡直接发动效果
        if(useCard.cardType==2){
            for(let i=0;i<useCard.appear.length;i++){
                console.log(useCard.appear[i].id,useCard.appear[i].obj,"魔法卡 战吼效果",useCard.appear[i].value,"发动卡玩家",useCard.owner)
                this.appearEffect(useCard.appear[i],useCard);
            }
        }
    }
    //使用武将卡 召唤武将
    useGeneralCard(useCard){
        console.log(useCard.owner,"使用武将卡",useCard.effect);
        //处理召唤逻辑
        useCard.initEffect();//初始卡牌buff
        useCard.initAttackCount();//初始化攻击次数

        this.roomData.orderCount++;
        useCard.addOrder(this.roomData.orderCount);//登场顺序
        this.socketUpdateCard(this.currentTurn,useCard.uid,1,useCard);//召唤武将
        this.roomData[this.currentTurn].tableCards.push(useCard);//卡加入数组 战吼效果可能要特殊处理作用效果是否排除此卡
        //处理战吼
        if(useCard.appear.length>0){
            for(let i=0;i<useCard.appear.length;i++){
                console.log(useCard.appear[i].id,useCard.appear[i].obj,"战吼效果",useCard.appear[i].value,"玩家",useCard.owner)
                this.appearEffect(useCard.appear[i],useCard);
            }
        }
    }
    //判断能否特招  need
    judgeCardNeed(card){
        if(card.need==0) return 0;
        let bool=0;
        for(let i=0;i<card.need.length;i++){
            // console.log(useCard.appear[i].id,useCard.appear[i].obj,"战吼效果",useCard.appear[i].value,"玩家",useCard.owner)
            if(this.judgeCardNeedOne(card.need[i],card)) bool++;
        }
        console.log(bool,"特招条件判断",card.need.length)
        if(bool==card.need.length) return 1;
        else return -1;
    }
    judgeCardNeedOne(effect,card){
        let player=card.owner;
        let other=player=="one"?"two":"one";
        switch (effect.id){
            case 901://存在卡数量
                // let arrCard=this.getConditionCard(effect,useCard);
                // let player=useCard.owner;
                // let arr=[];
                // let other=player=="one"?"two":"one";
                let cardPool=this.getCardPool(effect,player);//获取卡牌的位置数组
                console.log(cardPool.length,"<<<cardpool");
                //条件过滤处理
                let cardPoolNew=this.getConditionCardPool(cardPool,effect,card);
                console.log(cardPoolNew.length,"effect.num>",effect.num,"<<<cardPoolNew 条件过滤处理");
                return this.judgeCondition("num",effect.num,cardPoolNew.length);
                break;
            case 902://士气
                // effect.obj==1
                let hp1=true;
                let hp2=true;
                if(effect.obj==1||effect.obj==3){
                    hp1=this.judgeCondition("hp",effect.hp,this.roomData[player].hp)
                }
                if(effect.obj==2||effect.obj==3){
                    hp2=this.judgeCondition("hp",effect.hp,this.roomData[other].hp)
                }
                console.log(hp1,"hp条件判断",hp2)
                return hp1&&hp2;
                break;    
        }    
    }

    //处理战吼  亡语等效果
    appearEffect(effect,useCard){
        let player=useCard.owner;
        let other=player=="one"?"two":"one";
        switch (effect.id){
            case 201://抽卡
            // console.log(effect.obj,"战吼抽卡",effect.value);
                for(let i=0;i<effect.value;i++){
                    if(effect.obj==1||effect.obj==3){
                        let pCard=this.drawCard(player);
                        if(!pCard) break;
                    }
                    if(effect.obj==2||effect.obj==3){
                        let oCard=this.drawCard(other);
                        if(!oCard) break;
                    }
                }
                break;
            case 202://回血
            // console.log(effect.obj,"战吼回血",effect.value);
                if(effect.obj==1||effect.obj==3){
                    // this.drawCard(player);
                    this.updateHP(player,effect.value);
                }
                if(effect.obj==2||effect.obj==3){
                    // this.drawCard(other);
                    this.updateHP(other,effect.value);
                }
                break;
            case 301://破坏 破坏默认不会破坏本身
                this.destroyCard(effect,useCard);
                break;
            case 303://返回手卡
                this.cardToHand(effect,useCard);
                break;    
            case 304://返回卡组
                this.cardToRemain(effect,useCard);   
                break;  
            case 305://获得卡牌
                this.effectGetCard(effect,useCard);   
                break; 
            case 401://添加buff
                // this.destroyCard(effect,useCard);
                this.addBuff(effect,useCard);
                break;
            case 402://清除buff
                // this.destroyCard(effect,useCard);
                // console.log(">>>>>>>>>>>>>>>>>appearEffect清除buff",useCard);
                this.removeBuff(effect,useCard);    
                break;
        }
    }
    //301破坏卡牌  &&this.judgeCondition("hp",effect.hp,this.roomData[player].hp)
    destroyCard(effect,useCard){
        // let player=useCard.owner;
        let arrCard=this.getConditionCard(effect,useCard);
        for(let i=arrCard.length-1;i>-1;i--){
            let arrCardOne=arrCard[i];
            // this.judgeDeath(arrCardOne);
            if(arrCardOne.getBuffById(Card.BUFF_PROTECT).length>0){
                console.log(arrCardOne.cardName+"有buff守护 不会被效果破坏");
                this.socketUpdateCard(arrCardOne.owner,arrCardOne.uid,-5,0);
                continue;
            }
            this.removeCard(arrCardOne.owner,arrCardOne.uid);//,"tableCards"
            this.socketUpdateCard(arrCardOne.owner,arrCardOne.uid,-1,arrCardOne);
        }
    }  
    //303返回手卡
    cardToHand(effect,useCard){
        // let player=useCard.owner;
        let arrCard=this.getConditionCard(effect,useCard);
        for(let i=arrCard.length-1;i>-1;i--){
            let arrCardOne=arrCard[i];
            if(this.roomData[arrCardOne.owner].handCards.length<GameHandle.HANDCARD_LIMIT){
                arrCardOne.removeAllBuff();
                this.roomData[arrCardOne.owner].handCards.push(arrCardOne);
            }
            this.removeCard(arrCardOne.owner,arrCardOne.uid);//,"tableCards"
            this.socketUpdateCard(arrCardOne.owner,arrCardOne.uid,-2,0);
            console.log(this.roomData[arrCardOne.owner].handCards.length,"<<<返回手牌后的手牌数量 使用者手牌数>",this.roomData[useCard.owner].handCards.length,);
        }

    } 
    //304返回卡组
    cardToRemain(effect,useCard){
        let arrCard=this.getConditionCard(effect,useCard);
        for(let i=arrCard.length-1;i>-1;i--){
            let arrCardOne=arrCard[i];
            // if(this.roomData[useCard.owner].handCards.length<GameHandle.HANDCARD_LIMIT){
                arrCardOne.removeAllBuff();
                this.insertRandom(this.roomData[arrCardOne.owner].remainCards,arrCardOne);
                // this.roomData[useCard.owner].remainCards.push(arrCardOne);
            // }
            this.removeCard(arrCardOne.owner,arrCardOne.uid);//,"tableCards"
            this.socketUpdateCard(arrCardOne.owner,arrCardOne.uid,-3,0);
        }
    }
    //305获得卡牌
    effectGetCard(effect,useCard){
        let arrCard=this.getConditionCard(effect,useCard);
        for(let i=arrCard.length-1;i>-1;i--){
            let arrCardOne=arrCard[i];
            // console.log("305获得卡牌数据》》",arrCardOne)
            if(this.roomData[useCard.owner].handCards.length<GameHandle.HANDCARD_LIMIT){
                //根据effect.obj 需要分类判断获得对象 暂时未处理 只做了卡牌使用者
                if(effect.pos==4){//系统卡特殊处理   
                    let newCard=new Card(arrCardOne);
                    newCard.updateOwner(useCard.owner);
                    this.roomData[useCard.owner].handCards.push(newCard);
                    this.socketUpdateCard(newCard.owner,newCard.uid,2,newCard,4);//获得卡需要卡牌数据
                }else{
                    arrCardOne.removeAllBuff();
                    this.roomData[useCard.owner].handCards.push(arrCardOne);
                    if(effect.pos==3){//从卡组获得 需要移除卡组的卡
                        this.removeCard(arrCardOne.owner,arrCardOne.uid,"remainCards");//,"tableCards"
                    }
                    this.socketUpdateCard(arrCardOne.owner,arrCardOne.uid,2,arrCardOne,effect.pos);//获得卡需要卡牌数据
                } 
            }
            // if(effect.pos<4)this.removeCard(arrCardOne.owner,arrCardOne.uid);//非系统卡
        }
    }   
    //添加buff
    addBuff(effect,useCard){
        let player=useCard.owner;
        let arrCard=this.getConditionCard(effect,useCard);
        for(let i=arrCard.length-1;i>-1;i--){
            let arrCardOne=arrCard[i];
            let arrBuffId=String(effect.buffId).split("_");
            let arrBuffValue=String(effect.buffValue).split("_");
            let arrBuffValueRan=String(effect.buffValueRan).split("_");
            if(arrBuffId.length!=arrBuffValue.length){
                console.error("是否表配错了buffid和buffValue长度不一致 获得随机buff");
                let randomBuff = parseInt(arrBuffId[Math.floor(Math.random() * arrBuffId.length)]);
                // let randomValue=0;
                // if(randomBuff==Card.BUFF_ATTACK) randomValue=Math.ceil(Math.random() * parseInt(arrBuffValue[0]));//随机攻击力方法
                let randomValue=randomBuff==Card.BUFF_ATTACK?(parseInt(arrBuffValue[0])):0;
                let tableCard=this.getCardByUID(arrCardOne.uid,arrCardOne.owner,"tableCards");
                let buffUid=tableCard.addBuff(randomBuff,randomValue);
                if(buffUid)this.socketUpdateBuff(arrCardOne.owner,arrCardOne.uid,buffUid,randomBuff,1,randomValue);
            }else{
                for(let j=0;j<arrBuffId.length;j++){
                    //取到游戏中的card数据添加buff arrCardOne是临时的不能用
                    let tableCard=this.getCardByUID(arrCardOne.uid,arrCardOne.owner,"tableCards");
                    //铁腕术  tableCard不存在 可能有Bug
                    if(!tableCard){
                        console.log("tableCard不存在 有BUG？？？？？？")
                        continue;
                    }
                    let newBuffValue=arrBuffValue[j];
                    if(parseInt(arrBuffId[j])==Card.BUFF_ATTACK&&parseInt(arrBuffValueRan[j])==1) newBuffValue=arrBuffValue[j]>0?Math.ceil(Math.random() * parseInt(arrBuffValue[j])):Math.floor(Math.random() * parseInt(arrBuffValue[j]));//随机攻击力方法
                    let buffUid=tableCard.addBuff(arrBuffId[j],newBuffValue);
                    if(buffUid)this.socketUpdateBuff(arrCardOne.owner,arrCardOne.uid,buffUid,arrBuffId[j],1,newBuffValue);
                }
            }
        }
        // console.log("加完buffone>>",this.roomData["one"]["tableCards"]);
        // console.log("加完bufftwo>>",this.roomData["two"]["tableCards"]);
    }
    //移除buff
    removeBuff(effect,useCard){
        let player=useCard.owner;
        console.log("移除buff前one>>",this.roomData["one"]["tableCards"]);
        console.log("移除buff前two>>",this.roomData["two"]["tableCards"]);
        let arrCard=this.getConditionCard(effect,useCard);
        for(let i=arrCard.length-1;i>-1;i--){
            let arrCardOne=arrCard[i];
            let arrBuffId=String(effect.buffId).split("_");
            // let arrBuffValue=effect.buffValue.split("_");
            // if(arrBuffId.length!=arrBuffValue.length){
            //     console.error("有BUG 表配错了 buffid和buffValue 长度不一致");
            // }
            //取到游戏中的card数据添加buff arrCardOne是临时的不能用
            let tableCard=this.getCardByUID(arrCardOne.uid,arrCardOne.owner,"tableCards");
            console.log(tableCard,"tableCard 对比 arrCardOne",arrCardOne)
            if(effect.buffId==-1||effect.buffId=="-1"){//移除所有Buff
                // console.log(i,"移除前",arrCardOne.cardName,arrCardOne.buffList);
                let arrAll=tableCard.removeAllBuff();
                console.log(arrAll.length,"移除所有Buff",arrAll)
                for(let k=0;k<arrAll.length;k++){
                    let buffUid=arrAll[k].uid;
                    let buffId=arrAll[k].id;
                    if(buffUid)this.socketUpdateBuff(arrCardOne.owner,arrCardOne.uid,buffUid,buffId,-1,0);
                }
            }else{
                for(let j=arrBuffId.length-1;j>-1;j--){
                    let arrRemove=tableCard.removeBuff(arrBuffId[j]);
                    for(let k=0;k<arrRemove.length;k++){
                        let buffUid=arrRemove[k].uid;
                        let buffId=arrRemove[k].id;
                        if(buffUid)this.socketUpdateBuff(arrCardOne.owner,arrCardOne.uid,buffUid,buffId,-1,0);
                    }
                }
            }
        }
    }
    //根据条件筛选出卡池  (用于破坏 移除返回手牌卡组 召唤 获得 buff对象)
    getConditionCard(effect,useCard){
        let player=useCard.owner;
        let arr=[];
        let other=player=="one"?"two":"one";
        let cardPool=this.getCardPool(effect,player);//获取卡牌的位置数组
        let cardPoolNew=[];
        console.log(cardPool.length,"<<<cardpool 获取位置卡组");
        //条件过滤处理
        cardPoolNew=this.getConditionCardPool(cardPool,effect,useCard);
        // for(let i=0;i<cardPool.length;i++){
        //     let cardPoolOne=cardPool[i];
        //     if(cardPoolOne.uid==useCard.uid) {
        //         if(effect.id==301||effect.noself==1)
        //         continue;//破坏卡默认排除自身 判断301破坏 401添加buff 501
        //     }    
        //     if(this.judgeCondition("cardType",effect.cardType,cardPoolOne.cardType)&&this.judgeCondition("force",effect.force,cardPoolOne.force)&&
        //     this.judgeCondition("rare",effect.rare,cardPoolOne.rare)&&this.judgeCondition("name",effect.name,cardPoolOne.name)&&
        //     this.judgeCondition("atk",effect.atk,effect.pos==4?cardPoolOne.attack:cardPoolOne.getAttack()) ){
        //         cardPoolNew.push(cardPoolOne);
        //     }
        // }
        console.log(cardPoolNew.length,"<<<cardPoolNew 条件过滤后卡组");
        //随机或取对象
        let cardNum=cardPoolNew.length;
        let arrRan=this.getArrRandom((effect.value>=cardNum||effect.value==-1)?cardNum:effect.value,cardNum);
        if(cardNum>0){
            for(let i=cardPoolNew.length-1;i>-1;i--){
                if(arrRan.indexOf(i)!=-1){
                    arr.push(cardPoolNew[i]);
                }
            }
        }
        console.log(arrRan.length,"<随机数组",arr.length,"effect.value>",effect.value);
        return arr;
    }         
    //获取满足条件的卡范围
    getCardPool(effect,player){

        let other=player=="one"?"two":"one";
        let arr=[];
        let key="";
        if(effect.pos==4){//系统全卡组   召唤 获得卡等效果专用
            return this.cardData;
        }
        if(effect.obj==1||effect.obj==3){
            key=player;
            if(effect.pos==1){
                arr=arr.concat(this.roomData[key].handCards);
            }
            if(effect.pos==2){
                arr=arr.concat(this.roomData[key].tableCards);
                arr=arr.concat(this.roomData[key].magicCards);
            }
            if(effect.pos==3){
                arr=arr.concat(this.roomData[key].remainCards);
            }
        }
        if(effect.obj==2||effect.obj==3){
            key=other;
            if(effect.pos==1){
                arr=arr.concat(this.roomData[key].handCards);
            }
            if(effect.pos==2){
                arr=arr.concat(this.roomData[key].tableCards);
                arr=arr.concat(this.roomData[key].magicCards);
            }
            if(effect.pos==3){
                arr=arr.concat(this.roomData[key].remainCards);
            }
        }
        // console.log(this.roomData[key].tableCards.length,"《《桌上卡牌数量",effect.obj,effect.pos==2,"effect>>",effect)
        return arr;
    }
    getConditionCardPool(cardPool,effect,useCard){
        let cardPoolNew=[];
        for(let i=0;i<cardPool.length;i++){
            let cardPoolOne=cardPool[i];
            if(cardPoolOne.uid==useCard.uid) {
                if(effect.noself==1)//effect.id==301||
                continue;//破坏卡默认排除自身 判断301破坏 401添加buff 501
            }    
            if(this.judgeCondition("cardType",effect.cardType,cardPoolOne.cardType)&&this.judgeCondition("force",effect.force,cardPoolOne.force)&&
            this.judgeCondition("rare",effect.rare,cardPoolOne.rare)&&this.judgeCondition("name",effect.name,cardPoolOne.name)&&
            this.judgeCondition("hasBuff",effect.hasBuff,effect.pos==4?1:cardPoolOne.getBuffById(effect.hasBuff).length)&&this.judgeCondition("atk",effect.atk,effect.pos==4?cardPoolOne.attack:cardPoolOne.getAttack()) ){
                cardPoolNew.push(cardPoolOne);
            }
        }
        return cardPoolNew;
    }
    
    //桌面卡牌效果变动更新
    updateCardBuff(){

    }
    //===============卡牌攻击
    cardAttack(socket,data){
        console.log("卡牌攻击",data.uid,data.target);
        let other=this.currentTurn=="one"?"two":"one";
        // let card=this.roomData[this.currentTurn].tableCards[data.index];
        // let target=this.roomData[other].tableCards[data.targetIndex];
        let card=this.getCardByUID(data.uid,this.currentTurn,"tableCards");
        let target=this.getCardByUID(data.target,other,"tableCards");
        // if(this.roomData[other].tableCards.length==0){
        if(!card){
            console.log("cardAttack card没找到 有BUG？？？")
            return;
        }
        //攻击逻辑处理  攻击次数-1
        if(card.attackCount==undefined) {
            console.log("《《《《《《《《《《《《《《《《攻击次数不存在  卡组中的卡 有BUG???");
            return;
        }
        if(this.roomData.turn==1&&this.roomData.firstTurn==this.currentTurn){
            console.log("首回合先攻无法攻击");
            return;
        }
        if(card.attackCount<=card.attackedCount) {
            console.log(card.attackCount,"《《《《《《《《《《《《《《《《攻击次数为0 无法攻击 是否有BUG",card.attackedCount);
            return;
        }
        //嘲讽判断
        if(target&&target.getBuffById(Card.BUFF_TAUNT).length==0){
            for(let i=0;i<this.roomData[other].tableCards.length;i++){
                let cardOne=this.roomData[other].tableCards[i];
                if(cardOne.getBuffById(Card.BUFF_TAUNT).length>0){
                    console.log("《《《《《《《《必须优先攻击嘲讽武将》》》》》》》》》》");
                    return;
                }
            }
        }
        if(!target&&data.target!=-1){
            console.log("攻击对象不存在");
            // socket.emit("ERROR",{type:"error",msg:"游戏已结束！"});
            return;
        }
        //攻击次数-1
        card.changeAttackCount();
        //发送开始攻击消息
        this.socketCardAttack(this.currentTurn,data.uid,data.target);
        //判断触发陷阱卡
        let isTrap=this.checkTrap(1005,card.owner);
        if(isTrap){
            let exitCard=this.getCardByUID(card.uid,card.owner,"tableCards");
            console.log("陷阱效果处理完 card还在吗",!exitCard==null);
            if(!exitCard) {
                console.log("触发陷阱 攻击卡没有了 攻击中断return");
                return;
            }
        }
        // if(stopAttack){
        //     console.log("触发陷阱 攻击卡没有了 攻击中断return");
        //     return;
        // }
        if(data.target==-1){
            //data.targetIndex-1 直接攻击
                // let directStopAttack=this.checkTrap(1006,card);
                // if(directStopAttack){
                //     console.log("触发陷阱 直接攻击 攻击卡没有了 攻击中断return");
                //     return;
                // }

            console.log("other场上没有怪直接攻击");
            this.directAttack(card);
            return;
        }
        this.generalAttack(card,target);//,data.index,data.targetIndex
    }
    //检查陷阱卡触发 陷阱触发条件对方回合  owner参数对应need参数的Obj进行对比 (obj1表示对方回合 我方触发)
    checkTrap(trapId,owner){
        // let owner=card.owner;
        let isTrap=false;
        let other=this.currentTurn=="one"?"two":"one";
        let magicCards=this.roomData[other].magicCards;

        for(let i=0;i<magicCards.length;i++){
            let trapCard=magicCards[i];
             // console.log("trapCard",trapCard)
             console.log(i,"trapCard.need",trapCard.need)
            let need=trapCard.need;
            //判断 根据need.obj类型和触发对象类型比对  是否触发
            if( (need.obj==2&&trapCard.owner!=owner)||(need.obj==1&&trapCard.owner==owner)){
                if(need.id==trapId){
                    isTrap=true;
                    console.log(trapCard.cardName,trapCard.id,"满足触发陷阱",trapId);
                    //陷阱卡发动消息
                    this.removeCard(trapCard.owner,trapCard.uid);//,"tableCards"
                    this.socketUpdateCard(trapCard.owner,trapCard.uid,-4,trapCard);
                    i--;
                    //陷阱卡效果处理
                    for(let j=0;j<trapCard.appear.length;j++){
                        console.log(trapCard.appear[j].id,trapCard.appear[j].obj,"陷阱卡效果发动",trapCard.appear[j].value,"发动卡玩家",trapCard.owner)
                        this.appearEffect(trapCard.appear[j],trapCard);
                    }
                }
            }
        }
        return isTrap;
        
    }
    //直接攻击
    directAttack(card){
        let value=card.getAttack();
        let other=this.currentTurn=="one"?"two":"one";
        this.updateHP(other,-value);
        // this.roomData[other].hp-=value;
        // this.socketUpdateHP(other,-value);
        // if(this.roomData[other].hp<=0){
        //     console.log(other+"输了 血量小于等于0",this.roomData[other].hp);
        //     this.gameOver(this.currentTurn);
        // }
    }
    //武将攻击
    generalAttack(card,target){
        if(!card||!target){
            console.log(card,"攻击有bug 攻击者或目标不存在",target);
            return;
        }
        let value=card.getAttack()-target.getAttack();
        console.log("武将攻击对比",card.getAttack(),target.getAttack(),"差",value)
        let other=this.currentTurn=="one"?"two":"one";
        let damage=false;
        if(value==0){
            console.log("攻击相同判断是否同归于尽");
            this.judgeDeath(card);
            this.judgeDeath(target);
        }else if(value>0){
            damage=this.judgeDeath(target);
            if(damage){//计算伤害
                this.updateHP(other,target.getBuffById(Card.BUFF_DEFENSE).length>0?0:-value);
            }
        }else{
            damage=this.judgeDeath(card);
            if(damage){//计算伤害
                this.updateHP(this.currentTurn,card.getBuffById(Card.BUFF_DEFENSE).length>0?0:value);
            }    
        }
        console.log("damage>>",damage);
        console.log(this.roomData[this.currentTurn].hp,"<攻击hp 被攻击hp>",this.roomData[other].hp);        
        console.log(this.roomData[this.currentTurn].tableCards.length,"<场上武将卡数量>",this.roomData[other].tableCards.length)
    }
    //HP士气改变  type 1效果  2战斗
    updateHP(player,value){
        let other=player=="one"?"two":"one";
        this.roomData[player].hp+=value;
        if(this.roomData[player].hp>GameHandle.INIT_HP){//hp溢出
            value-=this.roomData[player].hp-GameHandle.INIT_HP;
            this.roomData[player].hp=GameHandle.INIT_HP;
        }
        this.socketUpdateHP(player,value);
        if(value<0&&this.roomData[player].hp<=0){
            console.log(player+"输了 血量小于等于0",this.roomData[player].hp);
            this.gameOver(other);
        }
    }
    //判断处理卡牌死亡
    judgeDeath(card){
        let buffD=card.getBuffById(Card.BUFF_SHIELD);
        if(buffD.length>0){
            card.removeBuff(Card.BUFF_SHIELD);
            //发送更新buff消息
            this.socketUpdateBuff(card.owner,card.uid,buffD[0].uid,Card.BUFF_SHIELD,-1,1);//攻击移除圣盾1
            return false;
        }else{
            let death=card.death;
            let deathOwner=card.owner;
            //发送卡牌破坏消息
            console.log(card.owner,"judgeDeath",card.uid)
            this.socketUpdateCard(card.owner,card.uid,-1,card);
            this.removeCard(card.owner,card.uid,"tableCards");
            //处理亡语效果  判断条件 登场的卡
            if(card.order>0&&death.length>0){
                for(let i=0;i<death.length;i++){
                    console.log(death[i].id,death[i].obj,"亡语效果",death[i].value,"玩家",deathOwner)
                    this.appearEffect(death[i],card);
                }
            }
            return true;
        }
    }
    //处理卡牌破坏移除 
    removeCard(key,uid,type="all"){
        //this.roomData[key][type].splice(cardIndex,1);
        if(type=="all"){
            if(this.removeCard(key,uid,"tableCards")) return true;
            if(this.removeCard(key,uid,"magicCards")) return true;
            if(this.removeCard(key,uid,"handCards")) return true;
            if(this.removeCard(key,uid,"remainCards")) return true;
        }else{
            let cardList=this.roomData[key][type];
            for(let i=0;i<cardList.length;i++){
                let cardOne=cardList[i];
                if(cardOne.uid==uid){
                    cardList.splice(i,1);
                    return true;
                    // break;
                }
            }
        }
    }
    getRemoveCard(key,type,uid){
        let cardList=this.roomData[key][type];
        for(let i=0;i<cardList.length;i++){
            let cardOne=cardList[i];
            if(cardOne.uid==uid){
                return cardList.splice(i,1)[0];
            }
        }
        console.log("getRemoveCard方法居然没有找到删除的卡  有BUG？？？？？？")
        return null;
    }
    //获取桌面卡牌类型数量
    // getTableCardByType(playerkey,cardType){
    //     let generalNum=0;
    //     let magicNum=0;
    //     for(let i=0;i<this.roomData[playerkey].tableCards.length;i++){
    //         let tableCard=this.roomData[playerkey].tableCards[i];
    //         if(tableCard.cardType==1) generalNum++;
    //         else magicNum++;
    //     }
    //     return cardType==1?generalNum:magicNum;
    // }
    //根据uid获取卡牌
    getCardByUID(uid,playerkey,type){
        for(let i=0;i<this.roomData[playerkey][type].length;i++){
            let card=this.roomData[playerkey][type][i];
            if(card.uid==uid) return card;
        }
        return null;
    }
    //根据id获取卡牌
    getCardByID(id,playerkey,type){
        let arr=[];
        for(let i=0;i<this.roomData[playerkey][type].length;i++){
            let card=this.roomData[playerkey][type][i];
            if(card.id==id) arr.push(card);
        }
        return arr;
    }
    //根据卡牌类型获取卡牌 通招  特招  魔法 陷阱    needType是否判断need字段召唤条件
    getCardByCardType(playerkey,type,cardType,needType=0){
        let arr=[];
        for(let i=0;i<this.roomData[playerkey][type].length;i++){
            let card=this.roomData[playerkey][type][i];
            if(card.cardType==cardType) {
                if(needType==1) {
                    if(card.need!=0) arr.push(card);
                }else if(needType==2){
                    if(cardType!=1||card.need==0) arr.push(card);
                }else arr.push(card);    
            }    
        }
        return arr;
    }
    //获取包含effect某种id效果的数组
    getEffectById(appear,effectId,cardType){
        let arrEffect=[];
        for(let i=0;i<appear.length;i++){
            // console.log(appear[i].id,useCard.appear[i].obj,"魔法卡 战吼效果",useCard.appear[i].value,"发动卡玩家",useCard.owner)
            if(appear[i].id==effectId) {
                if(!cardType||!appear[i].cardType||appear[i].cardType==cardType)   arrEffect.push(appear[i]);
            }    
        }
        return arrEffect;
    }

    //发送数据给前端
    sendData(user){
        let key=this.roomData.one.user==user?"one":"two";
        let other=key=="one"?"two":"one";
        //发送回合数据  GameDB.USER_DB.get(this.roomData[other].user).nick
        let nick=this.roomData[other].isAI?this.roomData[other].socket.nick:GameDB.USER_DB.get(this.roomData[other].user).nick;
        this.roomData[key].socket.emit("GAME",{type:"game_data",turn:this.roomData.turn,changeHand:this.roomData[key].changeHand,
            myTurn:this.currentTurn==key,turnTime:this.roomData.turnTime,useGeneralTimes:this.roomData[key].useGeneralTimes,
            gameState:this.gameState,cardData:this.getCurrentCardData(this.roomData[key],this.roomData[other]),
            hp:this.roomData[key].hp,otherName:nick,otherHP:this.roomData[other].hp,gameType:this.gameType
        });
        
        // this.roomData[key].socket.emit("GAME",{type:"game_start",otherName:this.roomData.two.user,first:this.roomData.firstTurn=="one",gameState:this.gameState});
        //发送卡牌数据
        // this.socketSendCards(this.roomData[key],this.roomData[other]);
        // player.socket.emit("GAME",{type:"card_info",handCards:arrHand,tableCards:arrTable,otherTableCards:other.tableCards.length,remainCards:player.remainCards.length,otherHandCards:other.handCards.length,otherRemainCards:other.remainCards.length});
    }
    //静态函数
    // static sayHello(name){
    //     //修改静态变量
    //     this.para = name;
    //     return 'Hello, ' + name;
    // }
    //=========================================一些特殊的工具方法
    //洗牌方法
    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]]
        }
        return a;
    }
    //获取随机整数数组
    getArrRandom(value,num){
        let array = [];
        while (array.length < value) {
            let randomNumber = Math.floor(Math.random() * num) ; // 生成0到num-1之间的随机整数
            if (!array.includes(randomNumber)) {
            array.push(randomNumber); // 将不重复的随机整数添加到数组
            }
        }
        return array;
    }
    //卡牌插入卡组随机位置
    insertRandom(arr,element){
        var position = Math.floor(Math.random() * (arr.length + 1));
        arr.splice(position, 0, element);
    }
    //条件判断
    judgeCondition(key,condition,value){
        // console.log(key,"<<<judgeCondition",condition,value)
        if(condition==undefined) return true;//属性不存在跳过判断直接返回true
        switch(key){
            case "name":
            case "rare":
            case "cardType":
                if(String(condition).indexOf(String(value))!=-1) return true;
                break;
            case "hasBuff":
                if(value>=1) return true;
                break;    
            case "force": 
            // case "rare":
                if(condition==value) return true;
                break;
            case "atk":
            case "num":    
            case "hp":
                // console.log(Number(condition.substring(1)),"<条件",key,"条件检查>>卡的值",value)
                if(condition.charAt(0)=="="){
                    if(Number(condition.substring(1))==value) return true;
                }else if(condition.charAt(0)==">"){
                    if(Number(condition.substring(1))<=value) return true;
                }else if(condition.charAt(0)=="<"){
                    if(Number(condition.substring(1))>=value) return true;
                }
                break;
            
        }
        return false;
    }
}
//静态变量
GameHandle.TURN_TIME=40;//单回合操作时间 秒
GameHandle.HANDCARD_COUNT = 3;//起始手牌数量
GameHandle.HANDCARD_LIMIT = 8;//手牌上限
GameHandle.TABLEGENERAL_LIMIT = 5;//武将卡上限
GameHandle.TABLEMAGIC_LIMIT = 5;//魔法卡上限
GameHandle.INIT_HP = 100;//初始士气
GameHandle.INIT_HP_DUNGEON = 150;//初始士气

// SocketHandle.para = 'Allen';
module.exports = GameHandle;