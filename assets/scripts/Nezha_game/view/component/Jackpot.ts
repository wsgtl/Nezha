import { _decorator, Component, Node } from 'cc';
import { NumFont } from '../../../Nezha_common/ui/NumFont';
import { LangStorage } from '../../../Nezha_common/localStorage/LangStorage';
const { ccclass, property } = _decorator;

@ccclass('Jackpot')
export class Jackpot extends Component {
    @property([NumFont])
    sys:NumFont[]=[];

    protected onLoad(): void {
        
    }
}


