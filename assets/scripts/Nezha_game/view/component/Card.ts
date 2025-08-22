import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CardType } from '../../GameUtil_Nezha';
import { tween } from 'cc';
import { ActionEffect } from '../../../Nezha_common/effects/ActionEffect';
import { UIOpacity } from 'cc';
import { UIUtils } from '../../../Nezha_common/utils/UIUtils';
import { Color } from 'cc';
import { delay } from '../../../Nezha_common/utils/TimeUtil';
import { v3 } from 'cc';
import { Skeleton } from 'cc';
import { sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Card')
export class Card extends Component {
    @property(Sprite)
    icon: Sprite = null;
    @property(sp.Skeleton)
    sk: sp.Skeleton = null;
    @property([sp.SkeletonData])
    sks: sp.SkeletonData[] = [];
    @property(Node)
    border: Node = null;
    @property([SpriteFrame])
    sf: SpriteFrame[] = [];

    type: CardType
    init(type: CardType) {
        this.setType(type);
        // this.borderAni();
        this.showBorder(false);
        this.setNormal();
    }
    setType(type: CardType) {
        this.type = type;
        if(type>=6){
            this.sk.skeletonData = this.sks[type-6];
            this.sk.node.active = true;
            this.icon.node.active = false;
            this.sk.animation = "c"+type;
        }else{
            this.icon.spriteFrame = this.sf[type - 1];
            this.sk.node.active = false;
            this.icon.node.active = true;
        }
       
        
       
    }
    showBorder(v: boolean) {
        this.border.active = v;
    }
    borderAni() {
        const c: UIOpacity = this.border.getComponent(UIOpacity);
        const duration = 0.5;
        const op1 = 100;
        const op2 = 255;

        tween(c)
            .to(duration, { opacity: op1 })
            .to(duration, { opacity: op2 })
            .call(() => {
                this.borderAni();
            }).start();
    }
    setColor(isDark: boolean) {
        const c = isDark ? 100 : 255;
        this.icon.getComponent(Sprite).color = new Color(c, c, c, 255);
        this.sk.getComponent(sp.Skeleton).color = new Color(c, c, c, 255);
        // this.mask.active = isDark;
    }
    setNormal() {
        this.setColor(false);
        this.showBorder(false);
    }
    /**发射粒子时卡片动画 */
    shotAni() {
        this.setColor(false);
        // if (this.type == CardType.c12 || this.type == CardType.c14) {
            ActionEffect.scaleBigToSmall(this.icon.node, 1.2, 1, 0.2);
            // tween(this.icon.node)
            // .to(0.1,{scale:v3(1.2,1.2)})
            // .to(0.1,{scale:v3(1,1)})
            // .start();
        // }
    }
}


