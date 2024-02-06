let GameDB=require('./gameDB');
const createDBConnection=require('./db');
const SQL=require('./sql');
// 游戏数据库
class CardEdit {
    //构造函数
    constructor() {  
        // if(!this.num) this.num=1;
        // this.num++;
        // console.log("Arena>>>this.num",this.num,Arena.instance);
        if (CardEdit.instance) {  
          return CardEdit.instance;  
        }  
        CardEdit.instance = this;  

    }  
    getInstance() {  
        return this;  
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
    cardEditHandle(socket,data){
        console.log("CardEditHandle>>",data);
        // if(args.)
        switch (data.type) {
            case "cardEdit_getList":
                this.cardEditGetList(socket,data);
                break;
            case "cardEdit_getInfo":
                this.cardEditGetInfo(socket,data);
                break;
            case "cardEdit_create":
                this.cardEditCreate(socket,data);
                break;    
            case "cardEdit_update":
                this.cardEditUpdate(socket,data);
                break;
            case "cardEdit_delete":
                this.cardEditDelete(socket,data);
                break;    
            case "cardEdit_use":
                this.cardEditUse(socket,data);
                break;      
        }
    }
    // UPDATE `sgdb`.`card` SET `info` = '{"force":3,"selectedCards":[21006,10307,10310,21004,21004,20302,10307,30001,21011,21007,21007,10304,21006,30108,10303,30004,10305,10303,20303,20303,30109,30102,21002,10305,20305,10302,21008,30001,10304,30101],"currentCards":[],"cardPool":[]}' WHERE `card`.`uid` = 6;
    cardEditUpdate(socket,data){
        console.log("收到客户端 卡组修改请求");
        let obj={type:"cardEdit_update"};
        let key;
        let value;
        if(data.cardName){
            key="name";
            value=data.cardName;
            obj.id=data.id;
            obj.cardName=data.cardName;
        }else if(data.card){
            let info=JSON.stringify({force:data.force,selectedCards:data.card});
            key="info";
            value=info;
            obj.cardList=data.card;
        }

        let connection = new SQL();
        connection.query(`update card set `+key+`=? where user= ? and uid = ? and cardtype = ?`, [value,data.user,data.id,2])
          .then((result) => {
            console.log("卡组修改成功");
            socket.emit("CARD",obj);
          })
          .catch((err) => {
              // res.json({message:"数据库异常"});
            console.log('Error executing query:',err.errno);
          });

        // if(!this.connection)    this.connection=createDBConnection();
        // this.connection.query(`update card set `+key+`=? where user= ? and uid = ? and cardtype = ?`, [value,data.user,data.id,2], (err, result) => {
        //     console.log(result.changedRows,"update result>>>",result);
        //     if (err) {
        //         console.log("数据库异常");
        //         return;
        //     }
        //     console.log("卡组修改成功");
        //     socket.emit("CARD",obj);
        // });
    }
    cardEditUse(socket,data){
        console.log("收到客户端 卡组启用请求");
        let connection = new SQL();
        connection.query(`update card set used=? where user= ? and used = ? and cardtype = ?`, [0,data.user,1,2])
          .then((result) => {
                console.log("启用卡组设置为0");
                connection.query(`update card set used=? where user= ? and uid = ? and cardtype = ?`, [1,data.user,data.id,2])
                  .then((result) => {
                        console.log("新卡组启用成功");
                        socket.emit("CARD",{type:"cardEdit_use",id:data.id});
                  })
                  .catch((err) => {
                      // res.json({message:"数据库异常"});
                    console.log('Error executing query:',err.errno);
                  });
          })
          .catch((err) => {
              // res.json({message:"数据库异常"});
            console.log('Error executing query:',err.errno);
          });

        // if(!this.connection)    this.connection=createDBConnection();
        // this.connection.query(`update card set used=? where user= ? and used = ? and cardtype = ?`, [0,data.user,1,2], (err, result) => {
        //     console.log(result.changedRows,"update result>>>",result);
        //     if (err) {
        //         console.log("数据库异常");
        //         return;
        //     }
        //     console.log("启用卡组设置为0");
        //     this.connection.query(`update card set used=? where user= ? and uid = ? and cardtype = ?`, [1,data.user,data.id,2], (err, result) => {
        //         console.log(result.changedRows,"update result>>>",result);
        //         if (err) {
        //             console.log("数据库异常");
        //             return;
        //         }
        //         console.log("新卡组启用成功");
        //         socket.emit("CARD",{type:"cardEdit_use",id:data.id});
        //     });
        // });  
    }
    cardEditDelete(socket,data){
        console.log("收到客户端 删除卡组");
        let connection = new SQL();
        connection.query('DELETE FROM card WHERE user = ? AND uid = ?', [data.user, data.id])
          .then((result) => {
            console.log('成功删除指定数据。受影响的行数:', result.affectedRows); 
            socket.emit("CARD",{type:"cardEdit_delete",id:data.id});
          })
          .catch((err) => {
              // res.json({message:"数据库异常"});
            console.log('Error executing query:',err.errno);
          });

        // if(!this.connection){
        //     this.connection=createDBConnection();
        // }
        // this.connection.query('DELETE FROM card WHERE user = ? AND uid = ?', [data.user, data.id], (err, result) => {  
        //     // 处理结果或错误  
        //     if (err) {  
        //         console.error("数据库异常", err);  
        //     } else {  
        //         console.log('成功删除指定数据。受影响的行数:', result.affectedRows);  
        //     }  
        //     socket.emit("CARD",{type:"cardEdit_delete",id:data.id});
        // });
    }
    cardEditCreate(socket,data){
        console.log("收到客户端 新建卡组请求");
        let connection = new SQL();
        connection.query(`select * from card where user = ? and cardtype = ? and used = ?`, [data.user,2,1])
          .then((result) => {
            if(result.length>0){
                connection.query(`update card set used=? where user= ? and used = ? and cardtype = ?`, [0,data.user,1,2])
                  .then((result) => {
                    console.log(result.length,"已启用卡组设置为0");
                  })
                  .catch((err) => {
                      // res.json({message:"数据库异常"});
                    console.log('Error executing query:',err.errno);
                  });

            }
            
            let info=JSON.stringify({force:data.force,selectedCards:data.card});
            console.log("inset的数据info",info)
            connection.query(`insert into card (user, cardtype, name, info, used) VALUES (?, ?, ?, ?, ?)`, [data.user,2,data.cardName,info,1])
              .then((result) => {
                console.log("对战卡组创建保存成功",result.insertId);
                socket.emit("CARD",{type:"cardEdit_create",id:result.insertId,cardName:data.cardName,force:data.force,used:1});
              })
              .catch((err) => {
                  // res.json({message:"数据库异常"});
                console.log('Error executing query:',err.errno);
              });
                  
          })
          .catch((err) => {
              // res.json({message:"数据库异常"});
            console.log('Error executing query:',err.errno);
          });

        // if(!this.connection){
        //     this.connection=createDBConnection();
        // }// and cardtype = ?
        // this.connection.query(`select * from card where user = ? and cardtype = ? and used = ?`, [data.user,2,1], (err, result) => {
        // // this.connection.query(`select * from card where user = ? and cardtype = ?`, [data.user,2], (err, result) => {
        //     console.log(result.length,"select result>>>",result);//result.length,
        //     if (err) {
        //         console.log("数据库异常");
        //         return;
        //     }
        //     if(result.length>0){
        //         this.connection.query(`update card set used=? where user= ? and used = ? and cardtype = ?`, [0,data.user,1,2], (err, result) => {
        //             console.log(result.length,"update result>>>",result);//result.length,
        //             if (err) {
        //                 console.log("数据库异常");
        //                 return;
        //             }
        //             console.log(result.length,"已启用卡组设置为0");
        //         });
        //     }
            
        //     let info=JSON.stringify({force:data.force,selectedCards:data.card});
        //     console.log("inset的数据info",info)
        //     this.connection.query(`insert into card (user, cardtype, name, info, used) VALUES (?, ?, ?, ?, ?)`, [data.user,2,data.cardName,info,1], (err, result) => {
        //         console.log(result.length,"insert result>>>",result);
        //         if (err) {
        //             console.log("数据库异常");
        //             return;
        //         }
        //         console.log("对战卡组创建保存成功",result.insertId);
        //         socket.emit("CARD",{type:"cardEdit_create",id:result.insertId,cardName:data.cardName,force:data.force,used:1});
        //     });
        
        // });    
            
    }
    cardEditGetList(socket,data){
        console.log("收到客户端 卡组列表请求");
        let connection = new SQL();
        connection.query(`select * from card where user = ? and cardtype = ?`, [data.user,2])
          .then((result) => {
            let arr=[];
            if(result.length==0){
                
            }else{
                for(let i=0;i<result.length;i++){
                    let obj={};
                    let info=JSON.parse(result[i].info);
                    obj.id=result[i].uid;
                    obj.cardName=result[i].name;
                    obj.used=result[i].used;
                    obj.force=info.force;
                    // obj.cardList=result[i].selectedCards;
                    arr.push(obj);
                }
                console.log("有数据解析卡组",arr.length);
            }
            socket.emit("CARD",{type:"cardEdit_getList",cardList:arr});
          })
          .catch((err) => {
              // res.json({message:"数据库异常"});
            console.log('Error executing query:',err.errno);
          });


        // if(!this.connection){
        //     this.connection=createDBConnection();
        // }
        // this.connection.query(`select * from card where user = ? and cardtype = ?`, [data.user,2], (err, result) => {
        //     console.log(result.length,"result>>>",result);
        //     if (err) {
        //         console.log("数据库异常");
        //         return;
        //     }
        //     let arr=[];
        //     if(result.length==0){
                
        //     }else{
        //         for(let i=0;i<result.length;i++){
        //             let obj={};
        //             let info=JSON.parse(result[i].info);
        //             obj.id=result[i].uid;
        //             obj.cardName=result[i].name;
        //             obj.used=result[i].used;
        //             obj.force=info.force;
        //             // obj.cardList=result[i].selectedCards;
        //             arr.push(obj);
        //         }
        //         console.log("有数据解析卡组",arr.length);
        //     }
        //     socket.emit("CARD",{type:"cardEdit_getList",cardList:arr});
        // });
    }
    cardEditGetInfo(socket,data){
        console.log("收到客户端 卡组详情请求");
        let connection = new SQL();
        connection.query(`select * from card where user = ? and uid = ?`, [data.user,data.id])
          .then((result) => {
            let obj={selectedCards:[]};
            if(result.length==0){
            }else{
                obj=JSON.parse(result[0].info);
                console.log("有数据解析卡组",obj);
            }
            socket.emit("CARD",{type:"cardEdit_getInfo",cardList:obj.selectedCards});
          })
          .catch((err) => {
              // res.json({message:"数据库异常"});
            console.log('Error executing query:',err.errno);
          });

        // if(!this.connection){
        //     this.connection=createDBConnection();
        // }
        // this.connection.query(`select * from card where user = ? and uid = ?`, [data.user,data.id], (err, result) => {
        //     console.log(result.length,"result>>>",result);
        //     if (err) {
        //         console.log("数据库异常");
        //         return;
        //     }
        //     let obj={};
        //     if(result.length==0){
                
        //     }else{
        //         obj=JSON.parse(result[0].info);
        //         console.log("有数据解析卡组",obj);
        //     }
        //     socket.emit("CARD",{type:"cardEdit_getInfo",cardList:obj.selectedCards});
        // });
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
CardEdit.CARD_LIMIT=30;//竞技场卡组数量上限

module.exports = CardEdit;