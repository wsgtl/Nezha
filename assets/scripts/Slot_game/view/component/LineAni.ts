import { _decorator, Component, Node } from 'cc';
import { GameUtil } from '../../GameUtil_Slot';
import { UIUtils } from '../../../Slot_common/utils/UIUtils';
import { ActionEffect } from '../../../Slot_common/effects/ActionEffect';
const { ccclass, property } = _decorator;

@ccclass('LineAni')
export class LineAni extends Component {
    @property(Node)
    content:Node = null;
    @property([Node])
    lines: Node[] = [];
    @property([Node])
    fs: Node[] = [];
    protected onLoad(): void {
        this.content.active = false;
    }
    private isShow: boolean = false;
    async show(v:boolean) {
        if(!v){
            await ActionEffect.fadeOut(this.content,0.2);
        }else{
            ActionEffect.fadeIn(this.content,0.2);
        }
        this.content.active = v;
        this.isShow = v;    
    }
    protected update(dt: number): void {
        if (!this.isShow) return;
        const lineY = dt * 3000;
        const fY = dt * 500;
        const lineBy = 575;
        const fBy = 60;
        this.lines.forEach((v, i) => {
            v.y -= lineY;
            if (v.y <= -lineBy) {
                v.y += lineBy * 2;
            }
        })
        this.fs.forEach((v, i) => {
            v.y -= fY;
            if (v.y <= -fBy) {
                v.y += fBy * 6;
            }
            UIUtils.setAlpha(v,(300-v.y)/300);
        })
    }
}


