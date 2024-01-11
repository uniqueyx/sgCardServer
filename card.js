// 卡片类
class Card {
    //构造函数
    constructor(data) {
        // console.log(socket.id);
        // console.log("args>>>",args)
        //生成卡片uid
        Card.UID++;
        this.uid=Card.UID;
        //数据赋值  卡牌固定数据
        this.id=data.id;
        this.cardName=data.cardName;
        this.cardType=data.cardType;//类型   1武将/2计策/3陷阱/4宝物
        this.info=data.info;//描述
        this.force=data.force;//势力
        this.rare=data.rare;//稀有度
        this.attack=data.attack;
        this.need=data.need;//使用条件
        this.effect=data.effect;//初始效果buff
        this.appear=JSON.parse(data.appearEffect);//战吼
        // console.log(typeof(this.appear),this.appear.length);
        this.death=JSON.parse(data.deathEffect);//亡语

        //初始化 
        this.buffList=[];
    }
    //说明
    //buff数据结构 101嘲讽 102圣盾 103潜行       401 攻击变化 value值  
    //类型  持续回合数  
    //=================类中函数
    //初始化归属  one/two
    updateOwner(owner){
        this.owner=owner;
    }
    //召唤成功 初始化buff
    initEffect(){
        if(typeof this.effect === "string"){
            let buffs=this.effect.split('_');
            for(let i=0;i<buffs.length;i++){
                this.addBuff(parseInt(buffs[i]));
            }
        }else{
            if(this.effect){
                this.addBuff(this.effect);
            }
        }
    }
    //登场次序
    addOrder(order){
        this.order=order;
    }
    //获得状态   101嘲讽 102圣盾 103潜行   
    addBuff(buffId,value=0){
        let uid=0;
        let hasBuff=false;
        for(let i=0;i<this.buffList.length;i++){
            let buff=this.buffList[i];
            if(buff.id==buffId){
                //处理BUFF叠加逻辑
                if(buffId<200){
                    hasBuff=true;
                }
            }
        }
        if(!hasBuff){
            Card.BUFF_UID++;
            this.buffList.push({uid:Card.BUFF_UID,id:buffId,value:value})
            uid=Card.BUFF_UID;
        }
        return uid;
    }
    //移除状态
    removeBuff(buffId){
        for(let i=0;i<this.buffList.length;i++){
            let buff=this.buffList[i];
            if(buff.id==buffId){
                this.buffList.splice(i,1);
                break;
            }
        }
    }
    removeAllBuff(){
        this.buffList=[];
    }
    //根据buffid获取buff
    getBuffById(buffId){
        for(let i=0;i<this.buffList.length;i++){
            let buff=this.buffList[i];
            if(buff.id==buffId){
                return buff;
            }
        }
        return null;
    }
    //获取实际攻击力
    getAttack(){
        let att=0;
        for(let i=0;i<this.buffList.length;i++){
            let buff=this.buffList[i];
            if(buff.id==Card.BUFF_ATTACK){
                att+=buff.value;
            }
        }
        let newAtt=this.attack+att;
        if(newAtt<0) newAtt=0;
        return newAtt;
    }
    //发送给客户端的数据格式
    getCardData(){
        let obj={};
        obj.uid=this.uid;
        obj.id=this.id;
        // obj.owner=this.owner;
        obj.attack=this.getAttack();
        // obj.buffList
        // obj.buffList=[];
        obj.buffList=this.buffList;
        return obj;
    }

    //静态函数
    // static sayHello(name){
    //     //修改静态变量
    //     this.para = name;
    //     return 'Hello, ' + name;
    // }
}
//静态变量
Card.UID = 0;
Card.BUFF_UID=0;

//BUFFID
Card.BUFF_TAUNT=101;//嘲讽
Card.BUFF_SHIELD=102;//圣盾
Card.BUFF_ATTACK=401;//攻击变化
module.exports = Card;