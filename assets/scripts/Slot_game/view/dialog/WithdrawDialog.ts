import { _decorator, Component, Node } from 'cc';
import ViewComponent from '../../../Slot_common/ui/ViewComponent';
import { SpriteFrame } from 'cc';
import { NumFont } from '../../../Slot_common/ui/NumFont';
import { Sprite } from 'cc';
import { Button } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { MoneyManger } from '../../manager/MoneyManger';
import { GameStorage } from '../../GameStorage_Slot';
import { Progress } from '../component/Progress';
import { FormatUtil } from '../../../Slot_common/utils/FormatUtil';
import { GameUtil, PayType } from '../../GameUtil_Slot';
import { LangStorage } from '../../../Slot_common/localStorage/LangStorage';
import { i18n } from '../../../Slot_common/i18n/I18nManager';
import { sprites } from '../../../Slot_common/recycle/AssetUtils';
import { Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WithdrawDialog')
export class WithdrawDialog extends ViewComponent {
    @property([SpriteFrame])
    cardSf: SpriteFrame[] = [];
    @property([SpriteFrame])
    tipSf: SpriteFrame[] = [];
    @property([SpriteFrame])
    paySf: SpriteFrame[] = [];
    @property(NumFont)
    num: NumFont = null;
    @property(Node)
    btnBack: Node = null;
    @property(Node)
    btnCash: Node = null;
    @property([Node])
    cards: Node[] = [];
    @property(Sprite)
    tip: Sprite = null;
    @property(Label)
    tips: Label = null;
    @property(Node)
    btnEdit: Node = null;
    @property(Node)
    hand: Node = null;


    private type: PayType;
    private withdrawNums = [GameUtil.getCashNum(), GameUtil.getCashNum(3)];
    show(parent: Node, args?: any): void {
        super.show(parent);
        this.btnBack.on(Button.EventType.CLICK, this.back, this);
        this.btnCash.on(Button.EventType.CLICK, () => { 
            // ViewManager.showTips("Insufficient balance for withdrawal.") 
            ViewManager.showTips(i18n.string("str_ibfw")) ;
        })
        this.btnEdit.on(Button.EventType.CLICK, this.onEdit, this);

        const symbol = LangStorage.getData().symbol
        const cur = GameStorage.getMoney();
        this.num.aligning = 1;
        this.num.num = symbol + " " + FormatUtil.toXXDXX(cur, 2,false);
        this.cards.forEach((v, i) => {
            v.on(Node.EventType.TOUCH_START, () => { this.changeCard(i) });
            const t1 = v.getChildByName("t1");
            const num = t1.getChildByName("num");
            const moneyNum = v.getChildByName("moneyNum").getComponent(NumFont);
            moneyNum.num = symbol + " " + this.withdrawNums[i];
            t1.getComponent(Progress).progress = cur / this.withdrawNums[i];
            const nf = num.getComponent(NumFont);
            nf.aligning = 1;
            nf.num = FormatUtil.toXXDXX(cur, 2,false) + " & " + this.withdrawNums[i];
        })
        this.changeCard(0);
        this.showPayIcon();
        const cardId = GameStorage.getCardId();
        if (!cardId)
            this.onEdit();
    }
    private back() {
        this.node.destroy();
    }
    private changeCard(i: number) {
        this.cards.forEach((v, j) => {
            v.getComponent(Sprite).spriteFrame = i == j ? this.cardSf[1] : this.cardSf[0];
        })
        // this.tip.spriteFrame = this.tipSf[i];
        // sprites.setTo(this.tip, i18n.curLangPath("tip"+(i+1)));
        this.tips.string = i18n.string("str_rri", this.withdrawNums[i].toString());
    }
    private showPayIcon() {
        const type = GameStorage.getPayType();
        this.cards.forEach((v) => {
            v.getChildByName("p").getComponent(Sprite).spriteFrame = this.paySf[type - 1];
        })
    }
    private showMethod() {
        ViewManager.showWithdrawalMethodDialog(() => {
            this.showPayIcon();
        }, () => { })
    }
    private onEdit() {
        this.hand.active = false;
        this.showMethod();
    }
}


