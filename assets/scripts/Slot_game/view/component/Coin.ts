import { _decorator, Component, Node } from 'cc';
import { NumFont } from '../../../Slot_common/ui/NumFont';
import { GameStorage } from '../../GameStorage_Slot';
import { ButtonLock } from '../../../Slot_common/Decorator';
import { CoinManger } from '../../manager/CoinManger';
import { v3 } from 'cc';
import { GameManger } from '../../manager/GameManager';
import { FormatUtil } from '../../../Slot_common/utils/FormatUtil';
const { ccclass, property } = _decorator;

@ccclass('Coin')
export class Coin extends Component {
    @property(NumFont)
    num: NumFont = null;
    @property(Node)
    coinNode: Node = null;

    public canClick: boolean = true;
    protected onLoad(): void {
        this.showCurCoin();
        this.node.on(Node.EventType.TOUCH_START, this.touch, this);
    }
    protected start(): void {
        CoinManger.instance.setCoinNode(this);
    }
    showNum(num: number) {
        const str = FormatUtil.toXXDXX(num);
        this.num.num = str;
        // const sc = str.length > 5 ? (5 / str.length) : 1;
        // this.num.node.scale = v3(sc, sc);
    }
    showCurCoin() {
        this.showNum(GameStorage.getCoin());
    }
    @ButtonLock(1)
    touch() {
        if (!this.canClick || GameManger.instance.isAni) return;
        CoinManger.instance.showDialog();
    }
    protected onDestroy(): void {
        // CoinManger.instance.setCoinNode(null);
    }
}


