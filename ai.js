// AI机器人类
let GameDB=require('./gameDB');
class AI {
    //构造函数
    constructor(gameType,level) {
        // console.log(socket.id);
        // console.log("args>>>",args)
        //生成AIuid
        AI.UID--;
        this.uid=AI.UID;
        this.gameType=gameType;
        let arr=["神秘玩家","卡牌大佬","游戏王","炉石粉","决斗三国","诸葛亮","刘备","曹操","孙权","司马懿","周瑜","吕布",
            "赵云","关羽","张飞","马超","黄忠","game","sg","jdsg","好玩吗","测试","体验玩家","作者","duel"];
        let randomNumber = Math.floor(Math.random() * arr.length);

        //剧情挑战相关属性参数
        this.level=level;
        if(this.level==0){
            this.dungeon=1;
            this.step=0;
        }else{
            this.dungeon=Math.floor(this.level / 10);
            this.step=this.level%10;
            if(this.step==3){
                this.dungeon++;
                this.step=0;
            }
        }
        //昵称
        if(this.gameType==3){
            this.nick="剧情boss"
            let arrDungeon=[[10108,10109,10110],[10206,10207,10208],[10308,10309,10310],[10408,10409,10410]];
            for(let i=0;i<GameDB.CARDLIST.length;i++){
                if(GameDB.CARDLIST[i].id==arrDungeon[this.dungeon-1][this.step]){
                    this.nick="剧情"+GameDB.CARDLIST[i].cardName;
                    break;
                }
            }    
        }else{
            this.nick=arr[randomNumber];
        }
        this.selectedCards=this.initSelectedCards();
        
        
        this.actionArgs = [  
        [2, 0],  
        [1, 2],  
        [1, 1],  
        [2, 0],
        [3, 0]  
    ];
        
    }
    //=================类中函数
    //生成ai 卡组
    initSelectedCards(){
        if(this.gameType==3){
            //剧情挑战卡组列表
            let arrDungeon=[
                [[10106,10106,30001,30107,10108,10108,10107,10107,10105,10105,
                10108,10108,10108,10108,10108,20103,20103,20104,20104,20105,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110],
                [10108,10108,30001,30107,10108,10108,10106,10106,10105,10105,
                10109,10109,10109,10109,10109,20103,20103,20104,20104,20105,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110],
                [10108,10108,10109,10109,30001,30107,10107,10107,10105,10105,
                10110,10110,10110,10110,10110,20103,20103,20104,20104,20105,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110]],

                [[10209,10210,30001,30107,10204,10204,10205,10205,10209,10210,
                10206,10206,10206,10206,10206,20201,20202,20203,20204,20205,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110],
                [30001,30107,10206,10206,10204,10204,10205,10205,10209,10210,
                10207,10207,10207,10207,10207,20201,20202,20203,20204,20205,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110],
                [10206,10206,10209,10210,10204,10204,30001,10207,10209,10210,
                10208,10208,10208,10208,10209,20201,20202,20203,20204,20205,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110]],

                [[30001,30107,10307,10305,10303,10303,10306,10306,10308,10308,
                10308,10308,10308,10308,10308,10308,20302,20303,20304,20305,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110],
                [30001,30107,10307,10305,10303,10303,10306,10306,10308,10308,
                10309,10309,10309,10309,10309,10308,20302,20303,20304,20305,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110],
                [10307,10305,10303,10303,10306,10306,10308,10308,10309,10309,
                10310,10310,10310,10310,10310,30001,20302,20303,20304,20305,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110]],

                [[10404,10404,10405,10406,10407,10405,10406,10407,20401,20404,
                10408,10408,10408,10408,10408,20401,20402,20403,20404,20405,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110],
                [10404,10404,10409,10408,10407,10407,10408,10408,20401,20404,
                10409,10409,10409,10409,10409,20401,20402,20403,20404,20405,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110],
                [10404,10404,10405,10406,10407,10408,10409,10409,30001,30107,
                10410,10410,10410,10410,10410,20401,20402,20403,20404,20405,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110,
                21013,21014,21015,30001,30002,30003,30107,30108,30109,30110]]



            ]   
            console.log("初始化AI挑战卡组",this.dungeon-1,this.step);
            return  arrDungeon[this.dungeon-1][this.step];
        }else{
            let arr=[[10110,10109,10108,10108,10107,10107,10106,10106,10105,10105,
                10104,10104,10103,10102,10101,20103,20104,20104,20105,20101,
                30002,21011,21013,21014,21015,30001,30107,30108,30109,30110],

                [10210,10209,10208,10208,10107,10207,10206,10206,10205,10205,
                10204,10204,10203,10202,10201,20203,20204,20202,20205,20201,
                30002,21011,21013,21014,21015,30001,30107,30108,30109,30110],

                [10410,10409,10408,10408,10407,10407,10406,10406,10405,10405,
                10404,10404,10403,10402,10401,20403,20404,20402,20405,20401,
                30002,21011,21013,21014,21015,30001,30107,30108,30109,30110],

                [10310,10309,10308,10308,10307,10307,10306,10306,10305,10305,
                10304,10304,10303,10302,10301,20303,20304,20302,20305,20301,
                30002,21011,21013,21014,21015,30001,30107,30108,30109,30110]
            ]
            let randomNumber = Math.floor(Math.random() * arr.length);
            return arr[randomNumber];
        }
        
        // return [19010,19010,30110,30109,30108,30107,30107,30001,30001,21015,21014,21013,21011,21011,20305,20304,20303,20303,10310,10309,10308,10308,10306,10306,10307,10307,10303,10303,10302,10302];
        // return [21014,21013,21012,21012,21011,21011,19010,19010,30107,30107,30110,30109,30108,30001,30001,21015,10410,10409,20405,20402,20402,10408,10408,10407,10407,10402,10402,10406,20404,20404];
    }
    //剧情挑战获取下一level
    getNextLevel(){
        this.step++;
        if(this.step==4){
            this.dungeon++;
            this.step=1;
        }
        return this.dungeon*10+this.step;
    }

    //updateowner
    updateOwner(owner){
        this.owner=owner;
    }
    //回合开始操作
    turnStart(data){
        if(data.myTurn){
            console.log(this.uid,"机器人的回合  操作");
            this.aiAction();
            return;
            //使用卡等操作
            // setTimeout(() => {
            //     this.useCard();
            // }, 1000+Math.random()*1000); 

            // setTimeout(() => {
            //     console.log("ai自动结束回合");
            //     if(this.gameHandle){
            //         this.gameHandle.gameHandle(this,{
            //             type: "turn_end",
            //             user: this.uid
            //         });
            //     }
            // }, 1000*Math.floor(8+Math.random()*3)); 
        }
    }

    async aiAction(){
        for (let i = 0; i < 5; i++) {  
            const [arg3, arg4] = this.actionArgs[i]; // 使用解构赋值来获取第三个和第四个参数  
            if(!this.gameHandle) return;
            let cardList=this.gameHandle.getCardByCardType("two", "handCards", arg3, arg4);
            let cardN="";//卡组名 
            cardList.forEach(element => {  
                cardN+="_"+element.cardName;
            });
            console.log("使用卡类型",i,"卡数量",cardList.length,cardN);
            if (await cardList.length>0) { // 如果函数返回true，则等待一秒并执行函数e  
                await new Promise(resolve => {  
                    setTimeout(() => {  
                        // 在这里执行函数e  
                        this.useRandomCard(cardList,arg3);
                        resolve(); // 等待一秒后解决Promise  
                    }, Math.random()*700+1300);  
                });  
            } else { // 如果函数返回false，则直接执行下一个函数  
                // console.log('函数返回false，直接执行下一个函数');  
            }  
            // console.log("test1")
        }    
        console.log("开始攻击");
        if(!this.gameHandle) return;
        let tableCards=this.gameHandle.getCardByCardType("two","tableCards",1);
        // let dt=tableCards.length<2?1000:2500/tableCards.length;
        for(let i=tableCards.length-1;i>-1;i--){
            console.log("攻击判断i",i)
            if (tableCards[i]) { // 如果函数返回true，则等待一秒并执行函数e  
                await new Promise(resolve => {  
                    setTimeout(() => {  
                        // 在这里执行函数e  
                        this.attackTarget(tableCards[i]);
                        // console.log("completeone attack")
                        resolve(); // 等待一秒后解决Promise  
                    }, Math.random()*1000+500);  
                });  
            }
        }
        console.log("ai攻击结束2秒后结束回合");
        setTimeout(() => {
                console.log("ai自动结束回合");
                if(this.gameHandle){
                    this.gameHandle.gameHandle(this,{
                        type: "turn_end",
                        user: this.uid
                    });
                }
            }, 2000+Math.random()*500); 
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
            let cardList=this.gameHandle.getCardByCardType("two","handCards",1,1);
            if(cardList.length>0){
                this.useRandomCard(cardList);
            }   
        }, 1000); 
        //特招武将
        setTimeout(() => {
            if(this.gameHandle){
                let cardListNeed=this.gameHandle.getCardByCardType("two","handCards",1,2);
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
    useRandomCard(cardList,cardType){
        if(!this.gameHandle) return;
        let randomNumber = Math.floor(Math.random() * cardList.length);
        let card=cardList[randomNumber];
        let handCards=this.gameHandle.roomData["two"].handCards;
        let index;
        //后面要改成 发送uid 
        let arrName="机器人手牌列表:";
        for(let i=0;i<handCards.length;i++){
            if(handCards[i].uid==card.uid) {
                index=i;
            }    
            arrName+="_"+handCards[i].cardName;
        }
        console.log(arrName);
        //魔法卡ai加入使用条件 特殊判断
        if(cardType==2){
            if(this.gameHandle.getEffectById(card.appear,301,1).length>0||this.gameHandle.getEffectById(card.appear,303,1).length>0||this.gameHandle.getEffectById(card.appear,304,1).length>0){
                if(this.gameHandle.roomData["one"].tableCards.length<=this.gameHandle.roomData["two"].tableCards.length){
                    console.log("武将数量有优势 不使用301 303 304破坏类魔法卡",card.cardName);
                    return;
                }
            }
            if(this.gameHandle.getEffectById(card.appear,301,3).length>0||this.gameHandle.getEffectById(card.appear,303,3).length>0||this.gameHandle.getEffectById(card.appear,304,3).length>0){
                if(this.gameHandle.roomData["one"].magicCards.length<=this.gameHandle.roomData["two"].magicCards.length){
                    console.log("陷阱数量有优势 不使用301 303 304破坏类魔法卡",card.cardName);
                    return;
                }
            }
            if(this.gameHandle.getEffectById(card.appear,401).length>0){
                if(this.gameHandle.roomData["two"].tableCards.length==0){
                    console.log("机器人没武将 不使用401增加buff魔法卡",card.cardName);
                    return;
                }
            }

        }
        this.gameHandle.gameHandle(this,{
            type: "card_use",
            user: this.uid,
            index:index,
            uid:card.uid
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
    attackTarget(card,judgeDouble=true){
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
        if(targetUid==-1){
            for(let i=0;i<targetCards.length;i++){
                let target=targetCards[i];
                if(card.getAttack()==target.getAttack()&&target.getBuffById(102).length==0){
                    targetUid=target.uid;
                    break;
                }
            }
        }
        if(targetCards.length>0&&targetUid==-1) return;
        console.log("机器人直接攻击",targetCards.length)
        this.gameHandle.gameHandle(this,{
            type: "card_attack",
            user: this.uid,
            uid:card.uid,
            target:targetUid
        });
        //判断双击
        if(judgeDouble&&card&&card.attackCount>card.attackedCount){
            setTimeout(() => {  
                // 在这里执行函数e  
                this.attackTarget(card,false);
                // resolve(); // 等待一秒后解决Promise  
            }, Math.random()*100+400);  
        }
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
        console.log("收到服务器推送emit消息",data.type);
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