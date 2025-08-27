import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Nezha_common/ui/DialogComtnet';
import { Button } from 'cc';
import { adHelper } from '../../../Nezha_common/native/AdHelper';
import { ViewManager } from '../../manager/ViewManger';
import { AudioManager } from '../../manager/AudioManager';
import { EnergyManger } from '../../manager/EnergyManager';
const { ccclass, property } = _decorator;

@ccclass('EnergyDialog')
export class EnergyDialog extends DialogComponent {
    @property(Node)
    btnGet: Node = null;
    @property(Node)
    btnNt: Node = null;
    private cb: Function;
    show(parent: Node, args?: any): void {
        super.show(parent);
        this.cb = args.cb;

        this.btnGet.on(Button.EventType.CLICK, () => {
            adHelper.showRewardVideo("加体力窗口", () => {
                this.closeAni();
                EnergyManger.maxEnergy();
            }, ViewManager.adNotReady);
        }

        )
        this.btnNt.on(Button.EventType.CLICK, () => {
            this.closeAni();
            adHelper.timesToShowInterstitial();
        })
        AudioManager.playEffect("light");
    }
}


