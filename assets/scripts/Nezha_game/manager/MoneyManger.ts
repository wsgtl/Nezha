import { Node } from "cc";
import { ViewManager } from "./ViewManger";
import { GameStorage } from "../GameStorage_Nezha";
import { isVaild } from "../../Nezha_common/utils/ViewUtil";
import { Money } from "../view/component/Money";
import { EventTracking } from "../../Nezha_common/native/EventTracking";
import { GameUtil } from "../GameUtil_Nezha";
import { MathUtil } from "../../Nezha_common/utils/MathUtil";
import { LangStorage } from "../../Nezha_common/localStorage/LangStorage";
import { ActionEffect } from "../../Nezha_common/effects/ActionEffect";

export class MoneyManger {
    public static _instance: MoneyManger = null;
    public static get instance(): MoneyManger {
        if (!this._instance) {
            this._instance = new MoneyManger();
        }
        return this._instance;
    }
    private _curDialog: Node = null;
    private _curMoney: Money = null;
    /**记录当前弹窗，防止显示多个 */
    public setDialog(cur: Node) {
        this._curDialog = cur;
    }
    /**记录当前钱节点 */
    public setMoneyNode(cur: Money) {
        this._curMoney = cur;
    }
    public getMoneyNode() {
        return this._curMoney;
    }
    /**显示弹窗 */
    public showDialog() {
        if (!this._curDialog) {//已经有弹窗不显示
            ViewManager.showWithdrawDialog();
        }
    }
    /**增加钱 */
    public addMoney(num: number, isShow: boolean = true) {
        const last = GameStorage.getMoney();
        const curMoney = GameStorage.addMoney(num);
        EventTracking.sendEventCoin(curMoney);
        if (isShow) {//立即显示
            if (isVaild(this._curMoney)) {
                this._curMoney.showCurMoney();
            }
        }else{
            ActionEffect.numAddAni(last,curMoney,(n:number)=>{this.showNum(n)});
        }
    }
    public showNum(num: number) {
        if (isVaild(this._curMoney)) {
            this._curMoney.showNum(num);
        }
    }
    public showCurNum() {
        if (isVaild(this._curMoney)) {
            this._curMoney.showCurMoney();
        }
    }
    /**获取奖励钱，根据剩余钱越变越少 */
    public getReward(bl: number = 1) {
        const cur = GameStorage.getMoney();
        const cha = GameUtil.getCashNum() - cur;
        const rate = LangStorage.getData().rate;
        const fsl1 = 700 * rate;//根据汇率计算
        const fsl2 = 500 * rate;//根据汇率计算
        const fsl3 = 250 * rate;//根据汇率计算
        if (cha > fsl1) {//钱越多，赚的钱比例越来越低
            return Math.floor(cha * MathUtil.random(5, 20) / 10 * bl) / 100;
        }
        if (cha > fsl2) {
            return Math.floor(cha * MathUtil.random(4, 15) / 10 * bl) / 100;
        }
        if (cha > fsl3) {
            return Math.floor(cha * MathUtil.random(3, 10) / 10 * bl) / 100;
        }
        // if (cur < 300) {
        //     return MathUtil.random(600, 2000) / 100* bl;
        // }
        // if (cur < 600) {
        //     return MathUtil.random(400, 1000) / 100* bl;
        // }
        // if (cur < 750) {
        //     return MathUtil.random(100, 400) / 100* bl;
        // }

        const max = cha / 200;
        const min = cha / 600;
        const num = MathUtil.randomFloat(min, max);

        let xsd = 2;
        if (cha <= 10) {
            // 计算 a 的数量级，并动态调整小数位数
            const magnitude = Math.floor(Math.log10(cha));
            xsd = 3 - magnitude; // 每小 10 倍，位数 +1
        }
        return parseFloat(num.toFixed(xsd)) * bl;
    }
}