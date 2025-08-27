import { FormatUtil } from "../../Nezha_common/utils/FormatUtil";
import { GameStorage } from "../GameStorage_Nezha";
import { GameManger } from "./GameManager";

/**体力管理 */
export namespace EnergyManger {
    /**体力刷新秒数 */
    export const duration: number = 180;
    /**体力值上线 */
    export const max: number = 30;
    let showCb:Function
    export function setShowCb(cb:Function){
        showCb = cb;
    }
    /**当前计算体力值 */
    export function calEnergy() {
        const energy = GameStorage.getEnergy();
        const cur = getCurSecond();
        const num = Math.max(0, Math.floor((cur - energy.time) / duration));
        const value = Math.min(max, energy.energy + num);
        GameStorage.setEnergy(value);
        GameStorage.setEnergyTime(cur);
    }
    /**加满体力 */
    export function maxEnergy() {
        GameStorage.setEnergy(max);
        showCb?.();
        GameManger.instance.autoNext();
    }
    /**加体力 */
    export function addEnergy() {
        const energy = GameStorage.getEnergy();
        if (energy.energy < max) {
            GameStorage.setEnergy(energy.energy + 1);
            GameStorage.setEnergyTime(getCurSecond());
        }
    }
    /**扣除体力 */
    export function subEnergy() {
        const energy = GameStorage.getEnergy();
        if (energy.energy > 0) {
            GameStorage.setEnergy(energy.energy - 1);
            if (energy.energy == max) {
                GameStorage.setEnergyTime(getCurSecond());
            }
            showCb?.();
            return true;
        }
        return false;
    }
    /**获取当前秒数 */
    function getCurSecond() {
        return Math.floor(Date.now() / 1000);
    }
    /**获取体力值显示 */
    export function getCurEnergyStr() {
        return GameStorage.getEnergy().energy + "l" + max;
    }
    /**获取体力值显示时间 */
    export function update() {
        const e = GameStorage.getEnergy();
        let t = 0;
        if (e.energy < max) {
            const cur = getCurSecond();
            t = duration - (cur - e.time);
            if (t == 0) {
                GameStorage.setEnergy(e.energy + 1);//加体力
                GameStorage.setEnergyTime(cur);
                showCb?.();
            }
        }
        return FormatUtil.mColonS(t);
    }

}