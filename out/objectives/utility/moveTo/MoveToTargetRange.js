/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "@wayward/game/utilities/math/Direction", "@wayward/game/utilities/math/Vector2", "../../../core/objective/Objective", "../../core/MoveToTarget"], function (require, exports, Direction_1, Vector2_1, Objective_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToTargetRange extends Objective_1.default {
        constructor(target, minRange, maxRange) {
            super();
            this.target = target;
            this.minRange = minRange;
            this.maxRange = maxRange;
        }
        getIdentifier() {
            return `MoveToTargetRange:(${this.target.x},${this.target.y},${this.target.z}):${this.minRange}:${this.maxRange}`;
        }
        getStatus() {
            return `Moving to target within range ${this.minRange} - ${this.maxRange}`;
        }
        async execute(context) {
            const objectivePipelines = [];
            const navigation = context.utilities.navigation;
            const rangeDelta = this.maxRange - this.minRange;
            for (const direction of Direction_1.Direction.CARDINALS) {
                const point = Vector2_1.default.DIRECTIONS[direction];
                for (let i = 0; i <= rangeDelta; i++) {
                    const targetPoint = new Vector2_1.default(this.target).add(new Vector2_1.default(point).multiply(this.minRange + i));
                    const targetTile = context.island.getTileSafe(targetPoint.x, targetPoint.y, this.target.z);
                    if (!targetTile) {
                        continue;
                    }
                    if (navigation.isDisabled(targetTile)) {
                        continue;
                    }
                    objectivePipelines.push([new MoveToTarget_1.default(targetTile, false)]);
                }
            }
            return objectivePipelines;
        }
    }
    exports.default = MoveToTargetRange;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvVGFyZ2V0UmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L21vdmVUby9Nb3ZlVG9UYXJnZXRSYW5nZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFjSCxNQUFxQixpQkFBa0IsU0FBUSxtQkFBUztRQUV2RCxZQUE2QixNQUFnQixFQUFtQixRQUFnQixFQUFtQixRQUFnQjtZQUNsSCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFVO1lBQW1CLGFBQVEsR0FBUixRQUFRLENBQVE7WUFBbUIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUVuSCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHNCQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuSCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8saUNBQWlDLElBQUksQ0FBQyxRQUFRLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzVFLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQztZQUNoRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFHakQsS0FBSyxNQUFNLFNBQVMsSUFBSSxxQkFBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM3QyxNQUFNLEtBQUssR0FBRyxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFNUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUN0QyxNQUFNLFdBQVcsR0FBRyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGlCQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFakcsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNGLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQzt3QkFDakIsU0FBUztvQkFDVixDQUFDO29CQUVELElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO3dCQUN2QyxTQUFTO29CQUNWLENBQUM7b0JBRUQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxzQkFBWSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLENBQUM7WUFDRixDQUFDO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBRUQ7SUEzQ0Qsb0NBMkNDIn0=