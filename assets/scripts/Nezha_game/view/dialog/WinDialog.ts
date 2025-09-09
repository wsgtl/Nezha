import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Nezha_common/ui/DialogComtnet';
import { v3 } from 'cc';
import { ActionEffect } from '../../../Nezha_common/effects/ActionEffect';
import { NumFont } from '../../../Nezha_common/ui/NumFont';
import { AudioManager } from '../../manager/AudioManager';
import { sp } from 'cc';
import { isVaild } from '../../../Nezha_common/utils/ViewUtil';
import { adHelper } from '../../../Nezha_common/native/AdHelper';
import { FormatUtil } from '../../../Nezha_common/utils/FormatUtil';
import { MathUtil } from '../../../Nezha_common/utils/MathUtil';
const { ccclass, property } = _decorator;

@ccclass('WinDialog')
export class WinDialog extends DialogComponent {
    @property(NumFont)
    num: NumFont = null;
    @property(sp.Skeleton)
    sk: sp.Skeleton = null;
    @property([sp.SkeletonData])
    skdata: sp.SkeletonData[] = [];

    start(): void {
        super.start();
        AudioManager.playEffect("win");
        this.bg.on(Node.EventType.TOUCH_START, () => {
            this.closeAni();
        });
    }
    async ani(num:number) {
        this.num.num = 0;
       await ActionEffect.skAniOnce(this.sk,"start",true);
       ActionEffect.skAni(this.sk,"loop");
       ActionEffect.numAddAni(0,num,(n:number)=>{if(this.num)this.num.num =FormatUtil.toXXDXX(n,0);},true,12);
    }
     /**关闭动画 */
     async closeAni() {
        if (this.isAni) return;
        this.isAni = true;
        await ActionEffect.skAniOnce(this.sk,"end",true);
        await ActionEffect.fadeOut(this.node, 0.2);
        this.node.destroy();
        this.closeCb?.();
        if (Math.random() < 0.7)
            adHelper.showInterstitial("大赢界面");
    }

    show(parent: Node, args?: any) {
        parent.addChild(this.node);
        this.closeCb = args.cb;
        const type = args.type;
        // const type = MathUtil.random(1,2);
        this.sk.skeletonData=this.skdata[type-1];  
       
        const path = ["root/all/all4/shengli_5/shengli_7","root/all/x_001/x_005/x_030"][type-1];
        const sockets =[new sp.SpineSocket(path,this.num.node.parent)];
        // this.sk.sockets.push(new sp.SpineSocket(path,this.num.node));//如果只是push(),就不会更新挂点
        this.sk.sockets=sockets;//必须整个挂点数组替换才能更新，如果只是push(),就不会更新挂点
        this.ani(args.num);
    }

}


