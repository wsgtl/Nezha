import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Nezha_common/ui/DialogComtnet';
import { Button } from 'cc';
import { NumFont } from '../../../Nezha_common/ui/NumFont';
import { FormatUtil } from '../../../Nezha_common/utils/FormatUtil';
import { LangStorage } from '../../../Nezha_common/localStorage/LangStorage';
import { ActionEffect } from '../../../Nezha_common/effects/ActionEffect';
const { ccclass, property } = _decorator;

@ccclass('FreeGameEnd')
export class FreeGameEnd extends DialogComponent {
    @property(NumFont)
    coin: NumFont = null;
    @property(NumFont)
    money: NumFont = null;
    @property(Node)
    btnCollect: Node = null;

    private cb: Function;
    show(parent: Node, args?: any): void {
        super.show(parent);

        this.cb = args.cb;

        ActionEffect.numAddAni(0, args.coin, (n: number) => {
            this.coin.num = FormatUtil.toXXDXX(n, 0);
        }, true, 20);
        ActionEffect.numAddAni(0, args.money, (n: number) => {
            this.money.num = LangStorage.getData().symbol + " " + FormatUtil.toXXDXXxsd(n);
        }, false, 10);


        this.btnCollect.on(Button.EventType.CLICK, this.onCollect, this);
    }
    onCollect() {
        this.cb?.();
        this.closeAni();
    }
}

