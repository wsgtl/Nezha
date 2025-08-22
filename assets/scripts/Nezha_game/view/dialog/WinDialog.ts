import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Nezha_common/ui/DialogComtnet';
import { v3 } from 'cc';
import { ActionEffect } from '../../../Nezha_common/effects/ActionEffect';
import { NumFont } from '../../../Nezha_common/ui/NumFont';
import { AudioManager } from '../../manager/AudioManager';
import { sp } from 'cc';
import { isVaild } from '../../../Nezha_common/utils/ViewUtil';
import { adHelper } from '../../../Nezha_common/native/AdHelper';
const { ccclass, property } = _decorator;

@ccclass('WinDialog')
export class WinDialog extends DialogComponent {
    @property(Node)
    ybs: Node = null;
    @property(Node)
    ybd: Node = null;
    @property(NumFont)
    num: NumFont = null;
    @property(sp.Skeleton)
    sk: sp.Skeleton = null;
    @property([Node])
    wins: Node[] = [];

    start(): void {
        super.start();
        this.ani();
        this.bg.on(Node.EventType.TOUCH_START, () => {
            this.node.destroy();
            if (Math.random() < 0.7)
                adHelper.showInterstitial("大赢界面");
        });
    }
    async ani() {
        AudioManager.playEffect("win");
        await ActionEffect.scale(this.ybs, 1.2, 1, 0, "backOut");
        // ActionEffect.scale(this.ybd,0.5,1,0,"backOut");
        this.loop();
    }
    async loop() {
        if (!isVaild(this.node)) return;
        await ActionEffect.scaleBigToSmall(this.ybs, 1.03, 1, 1.5);
        this.loop();
    }
    show(parent: Node, args?: any) {
        parent.addChild(this.node);
        // this.wins.forEach((v,i)=>{
        //     v.active = i==args.type-1;
        // })
        const ani = ["bigwin_loop", "megawin_loop"];
        this.sk.animation = ani[args.type - 1];
        ActionEffect.numAddAni(0,args.num,(n:number)=>{this.num.num =n},true,12);
        AudioManager.vibrate(1, 155);
    }
}


