let GameDB=require('./gameDB');
const createDBConnection=require('./db');
const SQL=require('./sql');
// 游戏数据库
class Arena {
    //构造函数
    constructor() {  
        // if(!this.num) this.num=1;
        // this.num++;
        // console.log("Arena>>>this.num",this.num,Arena.instance);
        if (Arena.instance) {  
          return Arena.instance;  
        }  
        Arena.instance = this;  

    }  
    getInstance() {  
        return this;  
    }    
    init(){
        if(!this.arenaMap)  this.arenaMap=new Map();

    }
    //随机势力
    getRandomForce(){
        let arr=this.getArrRandom(3,4);
        let newArr = arr.map(function(num) {  
            return num + 1;  
        });  
        return newArr;
    }
    //随机卡
    getRandomCard(user){
        // GameDB.CARDLIST;
        let arenaData=this.arenaMap.get(user);
        if(!arenaData.cardPool||arenaData.cardPool.length==0){//初始化卡池
            let arr=[];
            let len=GameDB.CARDLIST.length;
            for(let i=0;i<len;i++){
                let card=GameDB.CARDLIST[i];
                if(card.force==0||card.force==arenaData.force){
                    arr.push(card);
                }
            }
            console.log("根据势力筛选的卡池 数量",arr.length)
            arenaData.cardPool=arr;
        }
        // arenaData.force
        let rare;
        let randomRare=Math.random();
        if(randomRare<0.35) rare=1;
        else if(randomRare<0.7) rare=2;
        else if(randomRare<0.9) rare=3;
        else rare=4;

        let rarePool=[];
        // let len=GameDB.CARDLIST.length;
        for(let i=0;i<arenaData.cardPool.length;i++){
            let card=arenaData.cardPool[i];
            if(card.rare==rare){
                rarePool.push(card);
            }
        }
        console.log("rarePool",rarePool.length);
        //获取3随机数组
        let arrRan=this.getArrRandom(3,rarePool.length);
        let arrNew=[];
        for(let i=rarePool.length-1;i>-1;i--){
            if(arrRan.indexOf(i)!=-1){
                arrNew.push(rarePool[i].id);//rarePool[i]
            }
        }
        console.log("3个随机卡",arrNew);
        return arrNew;
    }


    //=====================工具方法
    //获取随机整数数组  0-num-1之间的value个
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
    //=================类中函数
    //arena消息
    arenaHandle(socket,data){
        console.log("arenaHandle>>",this.arenaMap,data);
        // if(args.)
        switch (data.type) {
            case "arena_getInfo":
                this.arenaGetInfo(socket,data);
                break;
            case "arena_select":
                this.arenaSelect(socket,data);
                break;
            case "arena_restart":
                this.arenaRestart(socket,data);
                break;    
                
        }
    }
    arenaRestart(socket,data){
        console.log("收到客户端 arenaRestart");
        // this.arenaMap.set(data.user,{});
        if(!this.arenaMap)  this.arenaMap=new Map();
        let arenaData=this.arenaMap.get(data.user);
        if(!arenaData) {
            arenaData={};
            this.arenaMap.set(data.user,arenaData);
        }    
        arenaData.force=0;
        arenaData.selectedCards=[];
        arenaData.currentCards=[];
        arenaData.currentCards=this.getRandomForce();
        // this.arenaGetInfo(socket,data);
        console.log("收到arenaRestart后 发送arena_info",arenaData)
        socket.emit("ARENA",{type:"arena_info",currentCards:arenaData.currentCards,
        force:arenaData.force,selectedCards:arenaData.selectedCards});
    }    
    arenaGetInfo(socket,data){
        console.log("收到客户端 arenaGetInfo");
        if(!this.arenaMap)  this.arenaMap=new Map();
        let arenaData=this.arenaMap.get(data.user);
        if(arenaData){
            //force selectedCards currentCards
            socket.emit("ARENA",{type:"arena_info",currentCards:arenaData.currentCards,
                force:arenaData.force,selectedCards:arenaData.selectedCards});
        }else{
            console.log("没有竞技数据需要查询数据库");
            let connection = new SQL();
            connection.query(`select * from card where user = ? and cardtype = ?`, [data.user,1])
              .then((result) => {
                if(result.length>0){
                    console.log("result[0]>>",result[0]);
                    let obj={};
                    if(result.length==0){
                        obj.force=0;
                        obj.selectedCards=[];
                        obj.currentCards=[];
                        obj.currentCards=this.getRandomForce();
                        arenaData=obj;
                        this.arenaMap.set(data.user,obj);
                    }else{
                        arenaData=JSON.parse(result[0].info);
                        console.log("有数据解析竞技卡组",arenaData);
                    }
                    socket.emit("ARENA",{type:"arena_info",currentCards:arenaData.currentCards,
                        force:arenaData.force,selectedCards:arenaData.selectedCards});
                }else console.log("没有玩家数据？？？？？");
              })
              .catch((err) => {
                  // res.json({message:"数据库异常"});
                console.log('Error executing query:',err.errno);
              });


            // if(!this.connection){
            //     this.connection=createDBConnection();
            // }
            // this.connection.query(`select * from card where user = ? and cardtype = ?`, [data.user,1], (err, result) => {
            //     console.log("result>>>",result);
            //     if (err) {
            //         console.log("数据库异常");
            //         return;
            //     }
            //     if(!result){
            //         console.log("数据库连接出错");
            //         return;
            //     }
            //     let obj={};
            //     if(result.length==0){
            //         obj.force=0;
            //         obj.selectedCards=[];
            //         obj.currentCards=[];
            //         obj.currentCards=this.getRandomForce();
            //         arenaData=obj;
            //         this.arenaMap.set(data.user,obj);
            //     }else{
            //         arenaData=JSON.parse(result[0].info);
            //         console.log("有数据解析竞技卡组",arenaData);
            //     }
            //     socket.emit("ARENA",{type:"arena_info",currentCards:arenaData.currentCards,
            //         force:arenaData.force,selectedCards:arenaData.selectedCards});
            // });          
            
        }
        
    }
    arenaSelect(socket,data){
        console.log("收到客户端 arenaSelect");
        let arenaData=this.arenaMap.get(data.user);
        if(arenaData&&arenaData.selectedCards.length==Arena.CARD_LIMIT){
            console.log("竞技卡组已经选好了",Arena.CARD_LIMIT);

            return;
        }
        let selectCard;
        if(data.selectType==0){//选择势力
            arenaData.force=arenaData.currentCards[data.index];
            selectCard=arenaData.force;
        }else{
            selectCard=arenaData.currentCards[data.index];
            arenaData.selectedCards.push(selectCard);
        }
        
        if(arenaData.selectedCards.length==Arena.CARD_LIMIT){
            console.log("竞技卡组已经选好了 存入数据库",Arena.CARD_LIMIT);
            arenaData.currentCards=[];
            arenaData.cardPool=[];
            socket.emit("ARENA",{type:"arena_selectInfo",force:arenaData.force,selectCard:selectCard,selectType:data.selectType,currentCards:arenaData.currentCards});
            console.log(JSON.stringify(arenaData).length,"保存数据",JSON.stringify(arenaData))

            let connection = new SQL();
            connection.query(`select * from card where user = ? and cardtype = ?`, [data.user,1])
              .then((result) => {
                if(result.length==0){
                    console.log("没有数据 插入数据库");
                    connection.query(`insert into card (user, cardtype, name, info, used) VALUES (?, ?, ?, ?, ?)`, [data.user,1,data.user+"竞技",JSON.stringify(arenaData),1])
                      .then((result) => {
                        console.log("竞技卡组创建保存成功");
                      })
                      .catch((err) => {
                          // res.json({message:"数据库异常"});
                        console.log('Error executing query:',err.errno);
                      });
   
                }else{
                    connection.query(`update card set info=? where user= ? and cardtype = ?`, [JSON.stringify(arenaData),data.user,1])
                      .then((result) => {
                        console.log("竞技卡组更新成功");
                      })
                      .catch((err) => {
                          // res.json({message:"数据库异常"});
                        console.log('Error executing query:',err.errno);
                      });
                    
                }
              })
              .catch((err) => {
                  // res.json({message:"数据库异常"});
                console.log('Error executing query:',err.errno);
              });


            // if(!this.connection){
            //     this.connection=createDBConnection();
            // }
            // this.connection.query(`select * from card where user = ? and cardtype = ?`, [data.user,1], (err, result) => {
            //     console.log(result.length,"result>>>",result);
            //     if (err) {
            //         console.log("数据库异常");
            //         return;
            //     }
            //     if(result.length==0){
            //         console.log("没有数据 插入数据库");
            //         this.connection.query(`insert into card (user, cardtype, name, info, used) VALUES (?, ?, ?, ?, ?)`, [data.user,1,data.user+"竞技",JSON.stringify(arenaData),1], (err, result) => {
            //             console.log(result.length,"insert result>>>",result);
            //             if (err) {
            //                 console.log("数据库异常");
            //                 return;
            //             }
            //             console.log("竞技卡组创建保存成功");
            //             // connection.release();
            //         });    
            //     }else{
            //         this.connection.query(`update card set info=? where user= ? and cardtype = ?`, [JSON.stringify(arenaData),data.user,1], (err, result) => {
            //             console.log(result.length,"update result>>>",result);
            //             if (err) {
            //                 console.log("数据库异常");
            //                 return;
            //             }
            //             console.log("竞技卡组更新成功");
            //             // connection.release();
            //         });  
            //     }
            //     // connection.release();
            // });    
            
        }else{
            //生成选择的卡
            arenaData.currentCards=this.getRandomCard(data.user);
            socket.emit("ARENA",{type:"arena_selectInfo",force:arenaData.force,selectCard:selectCard,selectType:data.selectType,currentCards:arenaData.currentCards});
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
// Arena.data =new Map();
Arena.CARD_LIMIT=30;//竞技场卡组数量上限

module.exports = Arena;