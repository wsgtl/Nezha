import './Nezha_common/Expand'
import { _decorator, Component, Node } from 'cc';
import { ViewManager } from './Nezha_game/manager/ViewManger';
import { GameStorage } from './Nezha_game/GameStorage_Nezha';
import { AudioSource } from 'cc';
import { AudioManager } from './Nezha_game/manager/AudioManager';
import { i18n } from './Nezha_common/i18n/I18nManager';
import { AudioStorage } from './Nezha_common/localStorage/AudioStorage';
import { LangStorage } from './Nezha_common/localStorage/LangStorage';
const { ccclass, property } = _decorator;

@ccclass('GameLaunch')
export class GameLaunch extends Component {
    @property(Node)
    mainNode:Node = null;
    @property(Node)
    upper:Node = null;
    @property(Node)
    lower:Node = null;
    @property(AudioSource)
    bgmNode:AudioSource = null;
    private static Instance: GameLaunch = null;

    start(): void {
        ViewManager.setMainSceneNode(this.mainNode,this.upper,this.lower);
        ViewManager.showLoading();
        // ViewManager.showHome();
    }
    onLoad(): void {
        if (GameLaunch.Instance === null) {
            GameLaunch.Instance = this;
        } else {
            this.destroy();
            return;
        }

        GameStorage.init();
        LangStorage.init();
        AudioManager.setBgmNode(this.bgmNode);
        AudioStorage.init();
        i18n.loadLang();//加载多语言


    }

 


}


