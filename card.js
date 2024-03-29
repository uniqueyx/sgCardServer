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
        this.need=JSON.parse(data.need);//使用条件
        this.effect=data.effect;//初始效果buff
        this.appear=JSON.parse(data.appearEffect);//战吼
        // console.log(typeof(this.appear),this.appear.length);
        this.death=JSON.parse(data.deathEffect);//亡语

        //初始化 
        this.buffList=[];
    }
    //说明
    //buff数据结构 101嘲讽 102圣盾 103守护 104铁壁 105双击         401 攻击变化 value值  
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
    //初始化重置攻击次数
    initAttackCount(onlyUpdate=false){
        //判断是否有105双击
        this.attackCount=this.getBuffById(Card.BUFF_DOUBLE).length>0?2:1;
        if(!onlyUpdate)     this.attackedCount=0;
    }
    //改变攻击次数
    changeAttackCount(){
        this.attackedCount++;
        // this.attackCount+=value;
        // if(this.attackCount<0) this.attackCount=0;
    }
    //登场次序
    addOrder(order){
        this.order=order;
    }
    //获得状态   101嘲讽 102圣盾 103守护 104铁壁 105双击     
    addBuff(buffId,value=0){
        buffId=parseInt(buffId);
        value=parseInt(value);
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
            // this.initAttackCount(true);
            if(buffId==Card.BUFF_DOUBLE) this.attackCount=2;
        }
        console.log(uid,"《《《《uid ==添加buff",hasBuff?"叠加":"获得新的",buffId,"buffList",this.buffList);
        return uid;
    }
    //根据buffid移除buff
    removeBuff(buffId){
        buffId=parseInt(buffId);
        let removeList=[];
        for(let i=0;i<this.buffList.length;i++){
            let buff=this.buffList[i];
            if(buff.id==buffId){
                removeList.push(this.buffList.splice(i,1));
                // break;
            }
        }
        this.initAttackCount(true);
        return removeList;
    }
    //根据uid移除buff
    removeBuffByUid(uid){
        for(let i=0;i<this.buffList.length;i++){
            let buff=this.buffList[i];
            if(buff.uid==uid){
                this.buffList.splice(i,1);
                break;
            }
        }
        this.initAttackCount(true);
    }
    //移除所有Buff
    removeAllBuff(){
        let removeList=this.buffList.concat();
        this.buffList=[];
        this.initAttackCount(true);
        return removeList;
    }
    //根据buffid获取buff
    getBuffById(buffId){
        buffId=parseInt(buffId);
        let arr=[];
        for(let i=0;i<this.buffList.length;i++){
            let buff=this.buffList[i];
            if(buff.id==buffId){
                arr.push(buff);
            }
        }
        return arr;
    }
    getBuffByUid(uid){
        for(let i=0;i<this.buffList.length;i++){
            let buff=this.buffList[i];
            if(buff.uid==uid){
                return buff;
            }
        }
        return null;
    }
    //获取可攻击次数
    getAttackCount(){

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
    getCardData(onlyUid=false){
        if(onlyUid) return {uid:this.uid};
        let obj={};
        obj.uid=this.uid;
        obj.id=this.id;
        // obj.owner=this.owner;
        obj.attackCount=this.attackCount;//攻击次数
        obj.attackedCount=this.attackedCount;
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
Card.BUFF_PROTECT=103;//守护
Card.BUFF_DEFENSE=104;//铁壁
Card.BUFF_DOUBLE=105;//双击
Card.BUFF_ATTACK=401;//攻击变化
module.exports = Card;