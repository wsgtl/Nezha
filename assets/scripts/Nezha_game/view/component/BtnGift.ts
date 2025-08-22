import { _decorator, Component, Node } from 'cc';
import { NumFont } from '../../../Nezha_common/ui/NumFont';
import { Button } from 'cc';
import { GameStorage } from '../../GameStorage_Nezha';
import { delay } from '../../../Nezha_common/utils/TimeUtil';
import { FormatUtil } from '../../../Nezha_common/utils/FormatUtil';
import { ViewManager } from '../../manager/ViewManger';
import { tween } from 'cc';
import { v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BtnGift')
export class BtnGift extends Component {
    @property(NumFont)
    time: NumFont = null;
    @property(Node)
    icon: Node = null;
    @property(Node)
    hand: Node = null;
    public curTime = 0;
    start() {
        // this.curTime = GameStorage.getPig().pigTime;
        this.node.on(Button.EventType.CLICK, () => {
            if(this.curTime>0)return;
            ViewManager.showLuckyGiftDialog(()=>{
                this.curTime = 120;
            })
        })
        this.showTime();
        this.countDown();
    }

    private async countDown() {
        if (this.curTime > 0) {
            this.curTime--;
            this.showTime();
            // GameStorage.setPigTime(this.curTime);
            this.hand.active = false;
        }else{
            this.hand.active = true;
            this.breathAni();
        }
        await delay(1, this.node);
        this.countDown();
    }
    private showTime(){
        const str = FormatUtil.mColonS(this.curTime, "：");
        this.time.num = str;
    }
    private breathAni(){
        tween(this.icon)
        .to(0.5,{scale:v3(0.9,0.9,1)})
        .to(0.5,{scale:v3(1,1,1)})
        .start();
    }
}


