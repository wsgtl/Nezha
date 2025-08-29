


/**游戏相关常量和方法 */

import { Vec3 } from "cc";
import { v3 } from "cc";
import { v2 } from "cc";
import { Vec2 } from "cc";
import { GameStorage } from "./GameStorage_Nezha";
import { MathUtil } from "../Nezha_common/utils/MathUtil";
import { LangStorage } from "../Nezha_common/localStorage/LangStorage";

/**结算数据 */
export type GameOverData = {
   score: number,
   // isWin: boolean
}


/**卡片类别 */
export enum CardType {
   none = 0,
   c1,//10
   c2,//J
   c3,//Q
   c4,//K
   c5,//A
   c6,//gem
   c7,//x2
   c8,//x3
   c9,//x4
   // c10,//x5
   wild,
   lotus,//金莲
   money,//钱弹窗
   freeGame,//免费游戏
}


/**奖励类别 */
export enum RewardType {
   none = 0,
   money = 1,//现金
   coin,//金币
   cash,//兑换卡
}
/**奖池类型 */
export enum JakcpotType {
   none = 0,
   grand = 1,
   major,
   mini
}
/**赢类型 */
export enum WinType {
   none = 0,
   big = 1,
   mega,
}
/**限时奖励类型 */
export enum LimitType {
   none = 0,
   cash = 1,
   lotus,
}
/**提现卡类型 */
export enum PayType {
   paypal = 1,
   googleplay,
   steam,
   visa
}
export type LuckyRewardData = {
   type: RewardType,
   num: number,
   isOpen: boolean
}
export type RewardData = {
   type: RewardType,
   num: number,
}
/**连线类型 */
export type LineOneData = {
   type: CardType,
   /**位置 列值*/
   line: number[],
}
export type LineData = {
   lines: LineOneData[],
   winType: WinType,
   coin: number
}

export namespace GameUtil {
   export const CardW: number = 204;//卡牌宽
   export const CardH: number = 195;//卡牌高
   export const AllRow: number = 3;//行数
   export const AllCol: number = 5;//列数
   export const CreateRow: number = 4;//生成的行数
   export const LotusNum: number = 20;//金莲收集到多少就触发幸运奖励
   export const TreasureNum: number = 10;//宝箱收集到多少就触发奖池奖励
   export const CashNum: number = 1000;//最低提现金额
   export const BaseBet: number = 500;//基础金币赌注
   export const MaxWildNum: number = 5;//免费游戏最多的wild
   /**登陆后是否弹签到 */
   export const Daily = { isShow: false };

   /**兑换券收集到可提现数量 */
   export const CashWithdrawNum: number = 100;
   /**签到金币数 */
   export const SigninCoins: number[] = [100, 200, 300, 400, 500, 600, 1000];
   /**3~5个免费游戏标可以有几次免费游戏 */
   export const FreeGameTimes: number[] = [7,9,11];
   /**每个连线卡获得金币数 */
   export const lineCoin: number[][] = [
      [],
      [100, 200, 500],//10
      [200, 500, 1000],//J
      [300, 600, 1500],//Q
      [500, 1000, 2500],//K
      [600, 1200, 3000],//A

      [1000, 2000, 5000],//gem
      [1500, 3000, 7000],//x2
      [2000, 4000, 10000],//x3
      [2500, 5000, 12000],//x4
      // [3000, 6000, 15000],//x5
   ]

   export function getCashNum(bl: number=1) {//获取最低提现金额
      const rate = LangStorage.getData().rate;
      return Math.floor(rate * CashNum * bl);
   }

   export function getCurDay() {
      const ct = Date.now();
      // 转换为天数（1天 = 24小时 × 60分钟 × 60秒 × 1000毫秒）
      return Math.floor(ct / (24 * 60 * 60 * 1000));
      // return GameStorage.getDaily().testDay;//测试
   }

   export function getLevelTimes(lv: number) {
      // return 1;
      return (lv - 1) + 10;
   }
   export function getRandomCard() {
      return MathUtil.random(1, 13);
   }
   export function getRandomNormalCard() {
      return MathUtil.random(1, CardType.wild);
   }

   /**20条连线 只记录y值*/
   export const lines: number[][] = [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2],
      [0, 1, 2, 1, 0],
      [2, 1, 0, 1, 2],

      [1, 0, 1, 0, 1],
      [1, 2, 1, 2, 1],
      [0, 0, 1, 2, 2],
      [2, 2, 1, 0, 0],
      [1, 2, 1, 0, 1],

      [1, 0, 1, 2, 1],
      [0, 1, 1, 1, 0],
      [2, 1, 1, 1, 2],
      [0, 1, 0, 1, 0],
      [2, 1, 2, 1, 2],

      [1, 1, 0, 1, 1],
      [1, 1, 2, 1, 1],
      [0, 0, 2, 0, 0],
      [2, 2, 0, 2, 2],
      [0, 2, 2, 2, 0],
   ];
   /**20条连线 */
   export const lines1: number[][][] = [
      [
         [0, 0, 0, 0, 0],
         [1, 1, 1, 1, 1],
         [0, 0, 0, 0, 0],
      ],
      [
         [1, 1, 1, 1, 1],
         [0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0],
      ],
      [
         [0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0],
         [1, 1, 1, 1, 1],
      ],
      [
         [1, 0, 0, 0, 1],
         [0, 1, 0, 1, 0],
         [0, 0, 1, 0, 0],
      ],
      [
         [0, 0, 1, 0, 0],
         [0, 1, 0, 1, 0],
         [1, 0, 0, 0, 1],
      ],
      [
         [0, 1, 0, 1, 0],
         [1, 0, 1, 0, 1],
         [0, 0, 0, 0, 0],
      ],
      [
         [0, 0, 0, 0, 0],
         [1, 0, 1, 0, 1],
         [0, 1, 0, 1, 0],
      ],
      [
         [1, 1, 0, 0, 0],
         [0, 0, 1, 0, 0],
         [0, 0, 0, 1, 1],
      ],
      [
         [0, 0, 0, 1, 1],
         [0, 0, 1, 0, 0],
         [1, 1, 0, 0, 0],
      ],
      [
         [0, 0, 0, 1, 0],
         [1, 0, 1, 0, 1],
         [0, 1, 0, 0, 0],
      ],
      [
         [0, 1, 0, 0, 0],
         [1, 0, 1, 0, 1],
         [0, 0, 0, 1, 0],
      ],
      [
         [1, 0, 0, 0, 1],
         [0, 1, 1, 1, 0],
         [0, 0, 0, 0, 0],
      ],
      [
         [0, 0, 0, 0, 0],
         [0, 1, 1, 1, 0],
         [1, 0, 0, 0, 1],
      ],
      [
         [1, 0, 1, 0, 1],
         [0, 1, 0, 1, 0],
         [0, 0, 0, 0, 0],
      ],
      [
         [0, 0, 0, 0, 0],
         [0, 1, 0, 1, 0],
         [1, 0, 1, 0, 1],
      ],
      [
         [0, 0, 1, 0, 0],
         [1, 1, 0, 1, 1],
         [0, 0, 0, 0, 0],
      ],
      [
         [0, 0, 0, 0, 0],
         [1, 1, 0, 1, 1],
         [0, 0, 1, 0, 0],
      ],
      [
         [1, 1, 0, 1, 1],
         [0, 0, 0, 0, 0],
         [0, 0, 1, 0, 0],
      ],
      [
         [0, 0, 1, 0, 0],
         [0, 0, 0, 0, 0],
         [1, 1, 0, 1, 1],
      ],
      [
         [1, 0, 0, 0, 1],
         [0, 0, 0, 0, 0],
         [0, 1, 1, 1, 0],
      ]
   ];

}



