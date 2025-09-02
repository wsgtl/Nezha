import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Nezha_common/ui/DialogComtnet';
import { Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FreeGameStart')
export class FreeGameStart extends DialogComponent {
    @property(Node)
    numNode: Node = null;
    @property(Node)
    btnStart: Node = null;

    private num: number = 7;
    private cb: Function;
    show(parent: Node, args?: any): void {
        super.show(parent);

        this.num = args.num;
        this.cb = args.cb;
        this.numNode.children.forEach(v => v.active = false);
        const nn = this.numNode.getChildByName("d" + this.num);
        if (nn) nn.active = true;

        this.btnStart.on(Button.EventType.CLICK, this.onStart, this);
    }
    onStart() {
        this.cb?.();
        this.closeAni();
    }
}


