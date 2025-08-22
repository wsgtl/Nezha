import { SpriteFrame } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { JakcpotType } from '../../GameUtil_Nezha';
import { Sprite } from 'cc';
import { sp } from 'cc';
import { delay } from '../../../Nezha_common/utils/TimeUtil';
const { ccclass, property } = _decorator;

@ccclass('Yb')
export class Yb extends Component {
    @property(Node)
    sp: Node = null;
    @property(Node)
    showNode: Node = null;
    @property(sp.Skeleton)
    sk: sp.Skeleton = null;
    @property([SpriteFrame])
    ws: SpriteFrame[] = [];
    @property([SpriteFrame])
    strs: SpriteFrame[] = [];

    type: JakcpotType;
    public isClick: boolean = false;
    public isAd:boolean = false;
    async show(type: JakcpotType) {
        this.showAni();
        this.isClick = true;
        this.type = type;
        await delay(0.2);
        this.sp.active = false;
        this.showNode.active = true;
        this.showNode.getChildByName("w").getComponent(Sprite).spriteFrame = this.ws[type - 1];
        this.showNode.getChildByName("str").getComponent(Sprite).spriteFrame = this.strs[type - 1];
       
        
    }
    hide() {
        this.sp.active = false;
        this.showNode.active = false;
    }
    showAd(v:boolean){
        this.sp.active = v;
        this.isAd = v;
    }
    showAni(){
        this.sk.node.active = true;
        this.sk.animation = "loop";
        delay(0.4).then(()=>{
            this.sk.node.active = false;
        })
    }
}


