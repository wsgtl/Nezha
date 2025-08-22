import { _decorator, Component, Node } from 'cc';
import { NumFont } from '../../../Slot_common/ui/NumFont';
import { Button } from 'cc';
import { FormatUtil } from '../../../Slot_common/utils/FormatUtil';
import { GameManger } from '../../manager/GameManager';
import { GameStorage } from '../../GameStorage_Slot';
import { GameUtil } from '../../GameUtil_Slot';
const { ccclass, property } = _decorator;

@ccclass('Bet')
export class Bet extends Component {
    @property(NumFont)
    num: NumFont = null;
    @property(Node)
    add: Node = null;
    @property(Node)
    sub: Node = null;
    @property(Node)
    btnMax: Node = null;
    @property(Node)
    free: Node = null;

    private level: number = 1;
    private readonly betNum: number = GameUtil.BaseBet;
    private index: number = 1;
    /**获取当前的赌注 */
    public get curBet() {
        return this.isFree ? this.betNum : this.index * this.betNum;//免费就只有500赌注
    }
    protected onLoad(): void {
        this.add.on(Button.EventType.CLICK, () => { this.changeIndex(1) });
        this.sub.on(Button.EventType.CLICK, () => { this.changeIndex(-1) });
        this.btnMax.on(Button.EventType.CLICK, () => { this.setIndex(this.level); });
        // this.num.aligning = 1;
    }
    private setIndex(i: number) {
        this.index = i;
        this.showBet();
    }
    public init(level: number) {
        this.level = level;
        this.setIndex(level);
        this.showAddAndSub();
    }
    private changeIndex(i: number) {
        this.level = GameStorage.getCurLevel();
        const cur = this.index + i;
        if (cur > this.level) this.index = 1;
        else if (cur < 1) this.index = this.level;
        else this.index = cur;
        this.showBet();
    }
    private showBet() {
        // this.num.aligning = 1;
        // this.num.num = FormatUtil.toXXDXX(this.curBet);
        this.num.num = this.curBet;
    }
    public showAddAndSub() {
        const show = GameStorage.getCurLevel() != 1;
        this.add.active = show;
        this.sub.active = show;
    }
    private isFree: boolean = false;
    public setFree(v: boolean) {
        this.node.active = !v;
        this.free.active = v;
        this.isFree = v;
    }
}


