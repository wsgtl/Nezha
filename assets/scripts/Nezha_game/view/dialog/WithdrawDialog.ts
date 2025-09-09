import { _decorator, Component, Node } from 'cc';
import ViewComponent from '../../../Nezha_common/ui/ViewComponent';
import { SpriteFrame } from 'cc';
import { NumFont } from '../../../Nezha_common/ui/NumFont';
import { Sprite } from 'cc';
import { Button } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { MoneyManger } from '../../manager/MoneyManger';
import { GameStorage } from '../../GameStorage_Nezha';
import { Progress } from '../component/Progress';
import { FormatUtil } from '../../../Nezha_common/utils/FormatUtil';
import { GameUtil, PayType } from '../../GameUtil_Nezha';
import { LangStorage } from '../../../Nezha_common/localStorage/LangStorage';
import { i18n } from '../../../Nezha_common/i18n/I18nManager';
import { sprites } from '../../../Nezha_common/recycle/AssetUtils';
import { Label } from 'cc';
import { instantiate } from 'cc';
import { MathUtil } from '../../../Nezha_common/utils/MathUtil';
import { BaseStorageNS, ITEM_STORAGE } from '../../../Nezha_common/localStorage/BaseStorage';
const { ccclass, property } = _decorator;

@ccclass('WithdrawDialog')
export class WithdrawDialog extends ViewComponent {
    @property([SpriteFrame])
    paySf: SpriteFrame[] = [];
    @property(NumFont)
    numMoney: NumFont = null;
    @property(NumFont)
    numCoin: NumFont = null;
    @property(Node)
    btnBack: Node = null;
    @property(Node)
    btnCash: Node = null;
    @property(Node)
    btnCoin: Node = null;
    @property(Node)
    btnOrder: Node = null;
    @property(Node)
    btnEdit: Node = null;
    @property([Node])
    contents: Node[] = [];
    @property(Node)
    moneyCards: Node = null;
    @property(Node)
    coinCards: Node = null;
    @property(Node)
    strEa: Node = null;
    @property(Label)
    cardId: Label = null;


    private btns: Node[] = [];
    private type: PayType;
    private withdrawNums = [GameUtil.getCashNum(), GameUtil.getCashNum(3)];
    show(parent: Node, args?: any): void {
        super.show(parent);
        this.btns = [this.btnCash, this.btnCoin, this.btnOrder]
        this.btnBack.on(Button.EventType.CLICK, this.back, this);
        this.btnEdit.on(Button.EventType.CLICK, this.onEdit, this);
        this.btnCash.on(Button.EventType.CLICK, () => { this.showContent(0) });
        this.btnCoin.on(Button.EventType.CLICK, () => { this.showContent(1) });
        this.btnOrder.on(Button.EventType.CLICK, () => { this.showContent(2) });
        this.showContent(0);

        this.init();
    }
    private init() {
        const symbol = LangStorage.getData().symbol
        const cur = GameStorage.getMoney();
        this.numMoney.num = symbol + " " + FormatUtil.toXXDXX(cur, 2, false);
        GameUtil.moneyCash.forEach((v, i) => {
            let item = this.moneyCards.children[0];
            if (i > 0) {
                item = instantiate(item);
                this.moneyCards.addChild(item);
            }
            item.getChildByName("num").getComponent(NumFont).num = symbol + " " + FormatUtil.toXXDXX(v, 0, false);
        })

        const curCoin = GameStorage.getCoin();
        this.numCoin.num = FormatUtil.toXXDXX(curCoin, 0, false);
        GameUtil.coinCash.forEach((v, i) => {
            let item = this.coinCards.children[0];
            if (i > 0) {
                item = instantiate(item);
                this.coinCards.addChild(item);
            }
            item.getChildByName("num").getComponent(NumFont).num = symbol + " " + FormatUtil.toXXDXX(v.money, 0, false);
            item.getChildByName("coin").getChildByName("num").getComponent(NumFont).num = FormatUtil.toXXDXX(v.coin, 0, false);
            const btn = item.getChildByName("btn");
            if (v.coin <= curCoin) {
                btn.getChildByName("btnGray").active = false;
                btn.on(Button.EventType.CLICK, this.waitWithdraw, this);
            } else {
                btn.getChildByName("btnGray").active = true;
            }
        })
        this.showPayIcon();
        const cardId = this.showCardId();
        if (!cardId)
            this.onEdit();
    }

    private showPayIcon() {
        const type = GameStorage.getPayType();
        this.moneyCards.children.forEach((v) => {
            v.getChildByName("pay").getComponent(Sprite).spriteFrame = this.paySf[type - 1];
        })
        this.coinCards.children.forEach((v) => {
            v.getChildByName("pay").getComponent(Sprite).spriteFrame = this.paySf[type - 1];
        })
    }
    private showMethod() {
        ViewManager.showWithdrawalMethodDialog(() => {
            this.showPayIcon();
        }, () => { this.showCardId() })
    }
    private back() {
        this.node.destroy();
    }
    private onEdit() {
        this.showMethod();
    }
    private showContent(index: number) {
        this.btns.forEach((v, i) => {
            v.getChildByName("select").active = i == index;
        })
        this.contents.forEach((v, i) => {
            v.active = i == index;
        })
    }
    /**排队提现 */
    private waitWithdraw() {
        let args = BaseStorageNS.getItem(ITEM_STORAGE.WAITWITHDRWW);
        let num: number;
        if (!args) {
            num = MathUtil.random(20000, 50000);
        } else {
            const t = JSON.parse(args);
            num = t.num;
            const time = t.time;
            const cha = (Date.now() - time) / (1000 * 60);
            const curNum = Math.round(num - Math.min(100, cha * MathUtil.random(1, 3)));
            num = Math.max(MathUtil.random(30, 100), curNum);
        }
        BaseStorageNS.setItem(ITEM_STORAGE.WAITWITHDRWW, JSON.stringify({ num, time: Date.now() }));
        ViewManager.showTips(`To withdraw cash, you need to queue up. There are still ${num} people ahead of you.`);
    }
    private showCardId() {
        const cardId = GameStorage.getCardId();
        this.strEa.active = !cardId;
        this.cardId.node.active = !!cardId;
        this.cardId.string = cardId;
        return cardId;
    }
}


