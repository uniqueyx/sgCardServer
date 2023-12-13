let Card=require('./card');
// 定义游戏玩家操作类
class GameHandle {
    //构造函数
    constructor(cardData,roomData) {
        this.cardData=cardData;
        this.roomData=roomData;
        // this.socket=socket;
        // console.log(socket.id);
        // console.log("args>>>",args)
    }
    //类中函数

    //初始化游戏  回合开始 回合结束
    initGame(){
        console.log(this.roomData.roomId,"游戏初始化");
        //发送开始游戏
        this.roomData.one.socket.emit("GAME",{type:"game_start"});
        this.roomData.two.socket.emit("GAME",{type:"game_start"});
        //初始化士气
        this.roomData.orderCount=0
        this.initHP();
        this.initUseGeneralTimes();
        //初始化卡组
        this.initCards("one");
        this.initCards("two");
       
        //发送卡牌数据
        this.socketSendCards( this.roomData.one,this.roomData.two);
        this.socketSendCards( this.roomData.one,this.roomData.two);

        //随机出先攻 开始回合
        let first=Math.random() * 2;//Math.floor(Math.random() * 2);
        this.roomData.firstTurn=first<1?"one":"two";
        console.log("firstTurn>>>",this.roomData.firstTurn);
        //回合计时器
        this.initTurnTimer();
        this.turnNext(false);
        // let other=this.roomData.firstTurn=="one"?"two":"one";
        // this.roomData.turn++;
        // this.roomData[this.roomData.firstTurn].socket.emit("GAME",{type:"turn_start",myTurn:true});
        // this.roomData[other].socket.emit("GAME",{type:"turn_start",myTurn:false});
    }
    //初始化士气
    initHP(){
        this.roomData["one"].hp=GameHandle.INIT_HP;
        this.roomData["two"].hp=GameHandle.INIT_HP;
    }
    //重置武将通常召唤次数
    initUseGeneralTimes(){
        this.roomData["one"].useGeneralTimes=1;
        this.roomData["two"].useGeneralTimes=1;
    }
    //初始化卡组
    initCards(key){
        let cardList=[10001,10001,10001,10001,10001,10001,10002,10002,10002,10002,10002,10002,10003,10003,10003,10003,10003,10003,
            10004,10004,10004,10004,10004,10004,10005,10005,10005,10005,10005,10005];
        this.shuffle(cardList);
        console.log("cardList>>",cardList)
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
    }
    //发送卡牌数据给客户端
    socketSendCards(player,other){
        let arrHand=[];
        for(let i=0;i<player.handCards.length;i++){
            arrHand.push(player.handCards[i].id);
        }
        let arrTable=[];
        for(let i=0;i<player.tableCards.length;i++){
            arrTable.push(player.tableCards[i].getCardData());
        }
        let arrMagic=[];
        for(let i=0;i<player.magicCards.length;i++){
            arrMagic.push(player.magicCards[i].getCardData());
        }
        let arrOtherTable=[];
        for(let i=0;i<other.tableCards.length;i++){
            arrOtherTable.push(other.tableCards[i].getCardData());
        }
        player.socket.emit("GAME",{type:"card_info",handCards:arrHand,tableCards:arrTable,magicCards:arrMagic,otherTableCards:arrOtherTable,otherMagicCards:other.magicCards.length,remainCards:player.remainCards.length,otherHandCards:other.handCards.length,otherRemainCards:other.remainCards.length});
    }
    //发送开始攻击消息
    socketCardAttack(key,index,targetIndex){
        let other=key=="one"?"two":"one";
        this.roomData[key].socket.emit("GAME",{type:"card_attack",isMe:true,index:index,targetIndex:targetIndex});
        this.roomData[other].socket.emit("GAME",{type:"card_attack",isMe:false,index:index,targetIndex:targetIndex});
    }
    //更新单个卡牌信息 暂时只处理场上  type(1 0 -1)召唤更新破坏移除
    socketUpdateCard(key,uid,type,card){
        let other=key=="one"?"two":"one";
        this.roomData[key].socket.emit("GAME",{type:"card_update",isMe:true,uid:uid,type:type,value:type==1?card.getCardData():0});
        this.roomData[other].socket.emit("GAME",{type:"card_update",isMe:false,uid:uid,type:type,value:type==1?card.getCardData():0});
    }
    //更新场上武将卡buff  type(1 0 -1)增加 更新 移除
    socketUpdateBuff(key,cardIndex,buffIndex,type,value){
        let other=key=="one"?"two":"one";
        this.roomData[key].socket.emit("GAME",{type:"buff_update",isMe:true,cardIndex:cardIndex,buffIndex:buffIndex,type:type,value:value});
        this.roomData[other].socket.emit("GAME",{type:"buff_update",isMe:false,cardIndex:cardIndex,buffIndex:buffIndex,type:type,value:value});
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
        if(this.roomData[this.currentTurn].socket!==socket){
            console.log("操作错误 非当前回合玩家 无法操作",data.type)
            return;
        }
        switch (data.type) {
            case "turn_end":
                this.turnEnd(socket,data);
                break;
            case "card_use":
                this.cardUse(socket,data);
                break;
            case "card_attack":
                this.cardAttack(socket,data);
                break;
        }
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
    //游戏结束逻辑 胜负 winType胜利类型 1hp归0 2无卡  draw平局   
    gameOver(win,winType=1,draw=false){
        clearInterval(this.turnTimer);
        let lose=win=="one"?"two":"one";
        this.roomData[win].socket.emit("GAME",{type:"game_over",winType:winType,result:draw?-1:1});
        this.roomData[lose].socket.emit("GAME",{type:"game_over",winType:winType,result:draw?-1:0});
    }
    //抽牌逻辑
    drawCard(currentTurn){
        // let currentTurn=this.currentTurn;
        //判断是否有卡没有则失败
        if(this.roomData[currentTurn].remainCards.length==0){
            console.log("没卡了失败");
            this.gameOver(other,2);
            return null;
        }
        let other=currentTurn=="one"?"two":"one";
        let card=this.roomData[currentTurn].remainCards.shift();
        this.roomData[currentTurn].handCards.push(card);
        console.log(this.roomData[currentTurn].remainCards.length,"抽牌》",card.id,card.cardName);
        this.roomData[currentTurn].socket.emit("GAME",{type:"draw",id:card.id});
        this.roomData[other].socket.emit("GAME",{type:"draw_other"});
        return card;
    }
    //================卡牌使用》》》
    cardUse(socket,data){
        let card=this.roomData[this.currentTurn].handCards[data.index];
        console.log(data.index,"使用卡牌",card);
        // if(this.getTableCardByType(this.currentTurn,card.cardType)==(card.cardType==1?GameHandle.TABLEGENERAL_LIMIT:GameHandle.TABLEMAGIC_LIMIT)){
        //     console.log(card.cardType,"桌面卡牌满了 无法使用",card);
        //     return;
        // }
        if(card.cardType==1&&this.roomData[this.currentTurn].tableCards.length==GameHandle.TABLEGENERAL_LIMIT){
            console.log(card.cardType,"桌面武将卡牌满了 无法使用",card);
            return;
        }
        if(card.cardType>1&&this.roomData[this.currentTurn].magicCards.length==GameHandle.TABLEMAGIC_LIMIT){
            console.log(card.cardType,"魔法陷阱卡区域满了 无法使用",card);
            return;
        }
        //
        //处理使用效果
        let useCard=this.roomData[this.currentTurn].handCards.splice(data.index,1)[0];
        
        if(useCard.cardType==1) this.useGeneralCard(useCard);
        if(useCard.cardType>1) this.useMagicCard(useCard);
        // this.roomData[this.currentTurn].tableCards.push(useCard);
        this.updateCardBuff();
    }
    //使用武将卡 召唤武将
    useGeneralCard(useCard){
        console.log(useCard.owner,"使用武将卡",useCard.effect);
        //处理召唤逻辑
        useCard.initEffect();
        this.roomData.orderCount++;
        useCard.addOrder(this.roomData.orderCount);//登场顺序
        this.socketUpdateCard(this.currentTurn,useCard.uid,1,useCard);//召唤武将
        this.roomData[this.currentTurn].tableCards.push(useCard);//卡加入数组 战吼效果可能要特殊处理作用效果是否排除此卡
        //处理战吼
        if(useCard.appear.length>0){
            for(let i=0;i<useCard.appear.length;i++){
                console.log(useCard.appear[i].id,useCard.appear[i].obj,"战吼效果",useCard.appear[i].value,"玩家",useCard.owner)
                this.appearEffect(useCard.appear[i],useCard.owner);
            }
        }
        
    }
    //处理战吼  亡语等效果
    appearEffect(effect,player){
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
            case 301://破坏
                this.destroyCard(effect,player);

        }
    }
    //破坏卡牌
    destroyCard(effect,player){
        let arrCard=this.getDestroyCard(effect,player);
        for(let i=arrCard.length-1;i>-1;i--){
            let arrCardOne=arrCard[i];
            this.socketUpdateCard(arrCardOne.owner,arrCardOne.uid,-1,0);
        }
    }   
    //根据条件筛选出要破坏的卡
    getDestroyCard(effect,player){
        let arr=[];
        let other=player=="one"?"two":"one";
        let cardPool=this.getCardPool(effect,player);
        let cardPoolNew=[];
        console.log(cardPool.length,"<<<cardpool");
        //条件过滤处理
        for(let i=0;i<cardPool.length;i++){
            let cardPoolOne=cardPool[i];
            if(this.judgeCondition("cardType",effect.cardType,cardPoolOne.cardType)&&this.judgeCondition("force",effect.force,cardPoolOne.force)&&
            this.judgeCondition("rare",effect.rare,cardPoolOne.rare)&&this.judgeCondition("name",effect.name,cardPoolOne.name)&&
            this.judgeCondition("atk",effect.atk,cardPoolOne.getAttack())&&this.judgeCondition("name",effect.name,cardPoolOne.name)){
                cardPoolNew.push(cardPoolOne);
            }
        }

        //随机或取对象
        let cardNum=cardPoolNew.length;
        let arrRan=(effect.value>=cardNum||effect.value==-1)?cardPool:this.getArrRandom(effect.value,cardNum);
        if(cardNum>0){
            for(let i=cardPoolNew.length-1;i>-1;i--){
                if(arrRan.indexOf(i)!=-1){
                    arr.push(cardPoolNew[i]);
                }
            }
        }
        return arr;
    }         
    //获取满足条件的卡范围
    getCardPool(effect,player){
        let other=player=="one"?"two":"one";
        let arr=[];
        let key="";
        if(effect.obj==4){//系统全卡组   召唤 获得卡等效果专用
            arr=this.cardData;
        }
        if(effect.obj==1||effect.obj==3){
            key=player;
            if(effect.pos==1){
                arr.concat(this.roomData[key].handCards);
            }
            if(effect.pos==2){
                arr.concat(this.roomData[key].tableCards);
                arr.concat(this.roomData[key].magicCards);
            }
            if(effect.pos==3){
                arr.concat(this.roomData[key].remainCards);
            }
        }
        if(effect.obj==2||effect.obj==3){
            key=other;
            if(effect.pos==1){
                arr.concat(this.roomData[key].handCards);
            }
            if(effect.pos==2){
                arr.concat(this.roomData[key].tableCards);
                arr.concat(this.roomData[key].magicCards);
            }
            if(effect.pos==3){
                arr.concat(this.roomData[key].remainCards);
            }
        }
        return arr;
    }
    //使用魔法卡
    useMagicCard(useCard){
        console.log("使用魔法卡",useCard.effect);
    }
    //桌面卡牌效果变动更新
    updateCardBuff(){

    }
    //===============卡牌攻击
    cardAttack(socket,data){
        console.log("卡牌攻击",data.index,data.targetIndex);
        let other=this.currentTurn=="one"?"two":"one";
        let card=this.roomData[this.currentTurn].tableCards[data.index];
        let target=this.roomData[other].tableCards[data.targetIndex];
        // if(this.roomData[other].tableCards.length==0){
        //攻击逻辑处理
        //发送开始攻击消息
        this.socketCardAttack(this.currentTurn,data.index,data.targetIndex);
        //判断触发陷阱卡
        let dealMagic=this.checkMagic();
        if(dealMagic){
            console.log("触发陷阱");
            return;
        }
        if(data.targetIndex==-1){
            //data.targetIndex-1 直接攻击
            console.log("other场上没有怪直接攻击");
            this.directAttack(card,data.index);
            return;
        }
        this.generalAttack(card,target,data.index,data.targetIndex);
    }
    //检查陷阱卡触发
    checkMagic(){
        return false;
    }
    //直接攻击
    directAttack(card,cardIndex){
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
    generalAttack(card,target,cardIndex,targetIndex){
        if(!card||!target){
            console.log(card,"攻击有bug 攻击者或目标不存在",target);
            return;
        }
        let value=card.getAttack()-target.getAttack();
        console.log("武将攻击对比",card.getAttack(),target.getAttack(),"差",value)
        let other=this.currentTurn=="one"?"two":"one";
        let damage=false;
        if(value==0){
            console.log("同归于尽");
            this.judgeDeath(card,cardIndex);
            this.judgeDeath(target,targetIndex);
        }else if(value>0){
            damage=this.judgeDeath(target,targetIndex);
            if(damage){//计算伤害
                this.updateHP(other,-value);
                // this.roomData[other].hp-=value;
                // this.socketUpdateHP(other,-value);
                // if(this.roomData[other].hp<=0){
                //     console.log(other+"输了 血量小于等于0",this.roomData[other].hp);
                //     this.gameOver(this.currentTurn);
                // }
            }
            
        }else{
            damage=this.judgeDeath(card,cardIndex);
            if(damage){//计算伤害
                this.updateHP(this.currentTurn,-value);
                // this.roomData[this.currentTurn].hp+=value;
                // this.socketUpdateHP(this.currentTurn,value);
                // if(this.roomData[this.currentTurn].hp<=0){
                //     console.log(this.currentTurn+"输了 血量小于等于0",this.roomData[this.currentTurn].hp);
                // }
            }    
        }
        console.log("damage>>",damage);
        console.log(this.roomData[this.currentTurn].hp,"<攻击hp 被攻击hp>",this.roomData[other].hp);        
        console.log(this.roomData[this.currentTurn].tableCards,"<场上武将卡数量>",this.roomData[other].tableCards)
    }
    //HP士气改变
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
    judgeDeath(card,cardIndex){
        if(card.getBuffById(102)){
            card.removeBuff(102);
            //发送更新buff消息
            this.socketUpdateBuff(card.owner,cardIndex,102,-1,0);
            return false;
        }else{
            let death=card.death;
            let deathOwner=card.owner;
            this.removeCard(card.owner,"tableCards",cardIndex);
            //发送卡牌破坏消息
            this.socketUpdateCard(card.owner,card.uid,-1,0);
            //处理亡语效果
            if(death.length>0){
                for(let i=0;i<death.length;i++){
                    console.log(death[i].id,death[i].obj,"亡语效果",death[i].value,"玩家",deathOwner)
                    this.appearEffect(death[i],deathOwner);
                }
            }
            return true;
        }
    }
    //处理卡牌破坏移除 
    removeCard(key,type,cardIndex){
        this.roomData[key][type].splice(cardIndex,1);
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

    //发送数据给前端
    sendData(user){
        let key=this.roomData.one.user==user?"one":"two";
        let other=key=="one"?"two":"one";
        //发送回合数据
        this.roomData[key].socket.emit("GAME",{type:"game_data",turn:this.roomData.turn,myTurn:this.currentTurn==key});
        //发送卡牌数据
        this.socketSendCards(this.roomData[key],this.roomData[other]);
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
    //条件判断
    judgeCondition(key,condition,value){
        if(condition==undefined) return true;//属性不存在跳过判断直接返回true
        switch(key){
            case "cardType":
                if(String(condition).indexOf(String(value))!=-1) return true;
                break;
            case "force": 
            case "rare":
            case "name":
                if(condition==value) return true;
                break;
            case "atk":
            case "hp":
                if(condition.charAt(0)=="="){
                    if(Number(condition.substring(1))==value) return true;
                }else if(condition.charAt(0)==">"){
                    if(Number(condition.substring(1))>=value) return true;
                }else if(condition.charAt(0)=="<"){
                    if(Number(condition.substring(1))<=value) return true;
                }
                break;
            
        }
        return false;
    }
}
//静态变量
GameHandle.TURN_TIME=10;//单回合操作时间 秒
GameHandle.HANDCARD_COUNT = 4;//起始手牌数量
GameHandle.HANDCARD_LIMIT = 8;//手牌上限
GameHandle.TABLEGENERAL_LIMIT = 5;//武将卡上限
GameHandle.TABLEMAGIC_LIMIT = 5;//魔法卡上限
GameHandle.INIT_HP = 100;//初始士气

// SocketHandle.para = 'Allen';
module.exports = GameHandle;