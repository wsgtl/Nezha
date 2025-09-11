import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Nezha_common/ui/DialogComtnet';
import { Button } from 'cc';
import { adHelper } from '../../../Nezha_common/native/AdHelper';
import { ViewManager } from '../../manager/ViewManger';
import { AudioManager } from '../../manager/AudioManager';
import { EnergyManger } from '../../manager/EnergyManager';
import { GameStorage } from '../../GameStorage_Nezha';
import { RewardType } from '../../GameUtil_Nezha';
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
            if(GameStorage.getEnergy().energy >=EnergyManger.max){
                ViewManager.showTips("The energy is full.");
                return;
            }
            adHelper.showRewardVideo("加体力窗口", () => {
                
                ViewManager.showRewardParticle(RewardType.energy,this.node,EnergyManger.getEnergyNode(),()=>{
                    EnergyManger.maxEnergy();
                    this.cb?.(); 
                })            
                this.closeAni();
            }, ViewManager.adNotReady);
        }

        )
        this.btnNt.on(Button.EventType.CLICK, () => {
            this.closeAni();
            this.cb?.(); 
            adHelper.timesToShowInterstitial();
        })
        AudioManager.playEffect("light");
    }
}


