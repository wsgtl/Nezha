import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Nezha_common/ui/DialogComtnet';
import { GameUtil, LimitType } from '../../GameUtil_Nezha';
import { Button } from 'cc';
import { GameStorage } from '../../GameStorage_Nezha';
import { GameManger } from '../../manager/GameManager';
import { adHelper } from '../../../Nezha_common/native/AdHelper';
import { ViewManager } from '../../manager/ViewManger';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('LimitDialog')
export class LimitDialog extends DialogComponent {
    @property(Node)
    sp:Node = null;
    @property(Node)
    btnGet:Node = null;
    @property(Node)
    btnNt:Node = null;
    @property([Node])
    limits:Node[] = [];

    private type:LimitType;
    private isFree:boolean = false;
    private cb:Function;
    show(parent: Node, args?: any): void {
        super.show(parent);
        this.type = args.type;
        this.cb  = args.cb;
        this.limits.forEach((v,i)=>{
            v.active = i==this.type-1;
        })
        this.isFree = GameStorage.getLimit().day<GameUtil.getCurDay();
        this.sp.active = !this.isFree;
        this.btnGet.on(Button.EventType.CLICK,()=>{
            if(this.isFree){
                this.onlimit();
            }else{
                const t = ["钱两个","莲花两个"][this.type-1];
                adHelper.showRewardVideo(t+"活动弹窗",()=>{
                    this.onlimit();
                },ViewManager.adNotReady);
            }
           
        })
        this.btnNt.on(Button.EventType.CLICK,()=>{
           this.closeAni();
           adHelper.timesToShowInterstitial();      
        })
        AudioManager.playEffect("light");
    }
    private onlimit(){
        if(this.type==LimitType.cash){//钱标两个
            // GameStorage.setLimitCash(5);
            GameManger.instance.cash2();
        }else{//莲花两个
            // GameStorage.setLimitLotus(5);
            GameManger.instance.lotus2();
        }
        GameStorage.setLimitDay(GameUtil.getCurDay());
        this.closeAni();
        this.cb?.();
    }
}


