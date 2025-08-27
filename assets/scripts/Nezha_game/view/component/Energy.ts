import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { NumFont } from '../../../Nezha_common/ui/NumFont';
import { ViewManager } from '../../manager/ViewManger';
import { GameStorage } from '../../GameStorage_Nezha';
import { EnergyManger } from '../../manager/EnergyManager';
import { delay } from '../../../Nezha_common/utils/TimeUtil';
const { ccclass, property } = _decorator;

@ccclass('Energy')
export class Energy extends Component {
    @property(Label)
    time:Label = null;
    @property(NumFont)
    num:NumFont = null;

    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START,()=>{
            ViewManager.showEnergyDialog()
        })
        this.showNum();
        this.updateTime();
        EnergyManger.setShowCb(()=>{
            this.showNum();
            this.showTime();
        })
    }
    private showNum(){
        const n = EnergyManger.getCurEnergyStr();
        this.num.num = n;
    }
    private showTime(){
        const n = EnergyManger.update();
        this.time.string = n;
    }
    /**每秒刷新一次时间 */
    private async updateTime(){
        this.showTime();
        await delay(1,this.node);
        this.updateTime();
    }

}


