import { _decorator, Component, Node } from 'cc';
import { NumFont } from '../../../Slot_common/ui/NumFont';
import { LangStorage } from '../../../Slot_common/localStorage/LangStorage';
const { ccclass, property } = _decorator;

@ccclass('Jackpot')
export class Jackpot extends Component {
    @property([NumFont])
    sys:NumFont[]=[];

    protected onLoad(): void {
        const symbol = LangStorage.getData().symbol;
        this.sys.forEach((v,i)=>{
            v.num = symbol;
        })
    }
}


