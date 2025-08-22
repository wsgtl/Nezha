import { _decorator, Component, Node } from 'cc';
import { TipsAni } from './TipsAni';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { ActionEffect } from '../../../Nezha_common/effects/ActionEffect';
import { Tween } from 'cc';
import { i18n } from '../../../Nezha_common/i18n/I18nManager';
import { sprites } from '../../../Nezha_common/recycle/AssetUtils';
const { ccclass, property } = _decorator;

@ccclass('DialogBox')
export class DialogBox extends Component {
    @property(TipsAni)
    tips:TipsAni = null;
    @property([SpriteFrame])
    sf:SpriteFrame[]=[];

    init(strIndex:number){
        sprites.setTo(this.tips.node, i18n.curLangPath("str_guide"+(strIndex)));
        // this.tips.node.getComponent(Sprite).spriteFrame = this.sf[strIndex-1];
        this.tips.init();
        this.tips.stopAni();
        Tween.stopAllByTarget(this.node);
    }
    async ani(){
        await ActionEffect.scale(this.node,0.4,1,0,"backOut");
        this.tips.startAni();
    }
}


