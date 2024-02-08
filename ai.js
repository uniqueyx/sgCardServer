// AI机器人类
class AI {
    //构造函数
    constructor(gameType) {
        // console.log(socket.id);
        // console.log("args>>>",args)
        //生成AIuid
        AI.UID--;
        this.uid=AI.UID;
        let arr=["神秘玩家","卡牌大佬","游戏王","炉石粉","决斗三国","诸葛亮","刘备","曹操","孙权","司马懿","周瑜","吕布",
            "赵云","关羽","张飞","马超","黄忠","game","sg","jdsg","好玩吗","测试","体验玩家","作者","duel"];
        let randomNumber = Math.floor(Math.random() * arr.length);
        this.nick=arr[randomNumber];
        this.selectedCards=this.initSelectedCards();
        this.gameType=gameType;
        //数据赋值  卡牌固定数据
        
    }
    //=================类中函数
    //生成ai 卡组
    initSelectedCards(){
        let arr=[[10110,10109,10108,10108,10107,10107,10106,10106,10105,10105,
                10104,10104,10103,10102,10101,20103,20104,20104,20105,20101,
                19010,21011,21013,21014,21015,30001,30107,30108,30109,30110],

                [10210,10209,10208,10208,10107,10207,10206,10206,10205,10205,
                10204,10204,10203,10202,10201,20203,20204,20202,20205,20201,
                19010,21011,21013,21014,21015,30001,30107,30108,30109,30110],

                [10310,10309,10308,10308,10307,10307,10306,10306,10305,10305,
                10304,10304,10303,10302,10301,20303,20304,20302,20305,20301,
                19010,21011,21013,21014,21015,30001,30107,30108,30109,30110]
            ]
        let randomNumber = Math.floor(Math.random() * arr.length);
        return arr[randomNumber];
        // return [19010,19010,30110,30109,30108,30107,30107,30001,30001,21015,21014,21013,21011,21011,20305,20304,20303,20303,10310,10309,10308,10308,10306,10306,10307,10307,10303,10303,10302,10302];
        // return [21014,21013,21012,21012,21011,21011,19010,19010,30107,30107,30110,30109,30108,30001,30001,21015,10410,10409,20405,20402,20402,10408,10408,10407,10407,10402,10402,10406,20404,20404];
    }
    updateOwner(owner){
        this.owner=owner;
    }
    //回合开始操作
    turnStart(data){
        if(data.myTurn){
            console.log(this.uid,"机器人的回合  操作");
            
            //使用卡等操作
            setTimeout(() => {
                this.useCard();
            }, 1000+Math.random()*1000); 

            setTimeout(() => {
                console.log("ai自动结束回合");
                if(this.gameHandle){
                    this.gameHandle.gameHandle(this,{
                        type: "turn_end",
                        user: this.uid
                    });
                }
            }, 1000*Math.floor(8+Math.random()*3)); 
            
        }
    }
    //handCards    tableCards   magicCards   remainCards  usedCards
    useCard(){
        if(!this.gameHandle) return;
        //魔法卡
        //后续机器人优化 魔法卡201 305 优先使用
        let magicList=this.gameHandle.getCardByCardType("two","handCards",2);
        if(magicList.length>0){
            this.useRandomCard(magicList);
        }
        // this.gameHandle.roomData["two"].handCards
        //通常武将
        setTimeout(() => {
            let cardList=this.gameHandle.getCardByCardType("two","handCards",1);
            if(cardList.length>0){
                this.useRandomCard(cardList);
            }   
        }, 1000); 
        //特招武将
        setTimeout(() => {
            if(this.gameHandle){
                let cardListNeed=this.gameHandle.getCardByCardType("two","handCards",1,true);
                if(cardListNeed.length>0){
                    this.useRandomCard(cardListNeed);
                }
            }
        }, 2500); 
        //攻击动作
        setTimeout(() => {
            this.attackCard();
        }, 3500); 

        //陷阱卡
        setTimeout(() => {
            if(this.gameHandle){
                let trapList=this.gameHandle.getCardByCardType("two","handCards",3);
                    if(trapList.length>0){
                        this.useRandomCard(trapList);
                    }
            }
        }, 6000);
    }
    useRandomCard(cardList){
        if(!this.gameHandle) return;
        let randomNumber = Math.floor(Math.random() * cardList.length);
        let card=cardList[randomNumber];
        let handCards=this.gameHandle.roomData["two"].handCards;
        let index;
        //后面要改成 发送uid 
        let arrName="手牌列表:";
        for(let i=0;i<handCards.length;i++){
            if(handCards[i].uid==card.uid) index=i;
            arrName+="_"+handCards[i].cardName;
        }
        console.log(arrName);
        this.gameHandle.gameHandle(this,{
            type: "card_use",
            user: this.uid,
            index:index
        });
    }
    attackCard(){
        if(!this.gameHandle) return;
        let tableCards=this.gameHandle.getCardByCardType("two","tableCards",1);
        let dt=tableCards.length<2?1000:2500/tableCards.length;
        for(let i=tableCards.length-1;i>-1;i--){
            if(tableCards[i]){
                setTimeout(() => {  
                    this.attackTarget(tableCards[i]);
                }, i * dt);  
            }
        }
    }
    //双击特殊判断
    attackTarget(card){
        if(!this.gameHandle) return;
        let targetCards=this.gameHandle.getCardByCardType("one","tableCards",1);
        let targetUid=-1;
        for(let i=0;i<targetCards.length;i++){
            let target=targetCards[i];
            if(card.getAttack()>target.getAttack()){
                targetUid=target.uid;
                break;
            }
        }
        if(targetCards.length>0&&targetUid==-1) return;
        this.gameHandle.gameHandle(this,{
            type: "card_attack",
            user: this.uid,
            uid:card.uid,
            target:targetUid
        });
    }

    //匹配成功
    matchSuccess(data){
        this.gameHandle.gameHandle(this,{
            type: "game_ready",
            user: this.uid
        });
    }
    //游戏解散 结束
    gameOver(data){
        console.log("游戏结束或解散");
        this.gameHandle=null;
    }
    //收到卡牌信息发送更换手牌
    cardInfo(){
        setTimeout(() => {
            console.log("ai自动发送更换手牌");
            if(this.gameHandle){
                this.gameHandle.gameHandle(this,{
                    type: "game_changeHand",
                    cardList:[],
                    user: this.uid
                });
            }
        }, 1000*Math.floor(2+Math.random()*3)); 
    }
    //服务器推送的socket消息
    emit(type,data){
        console.log("收到服务器推送emit消息",data.type,data);
        switch(data.type){
        case "card_info":
                this.cardInfo(data);
                break;
            case "turn_start":
                this.turnStart(data);
                break;
            case "match_success":
                this.matchSuccess(data);
                break;    
            case "game_dissolve":
                this.gameOver(data);
                break; 
            case "game_over":
                this.gameOver(data);
                break;     
                
        }
    }
    //静态函数
    // static sayHello(name){
    //     //修改静态变量
    //     this.para = name;
    //     return 'Hello, ' + name;
    // }
}
//静态变量
AI.UID = 0;
// AI.BUFF_UID=0;

module.exports = AI;