import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Shine')
export class Shine extends Component {
    start() {

    }

    update(deltaTime: number) {
        this.node.angle += deltaTime * 200;
    }
}


