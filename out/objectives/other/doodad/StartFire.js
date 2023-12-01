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
define(["require", "exports", "@wayward/game/game/entity/action/actions/StartFire", "@wayward/game/game/tile/ITileEvent", "../../../core/ITars", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireInventoryItem", "../../core/ExecuteAction", "../../core/Lambda", "../../core/MoveToTarget"], function (require, exports, StartFire_1, ITileEvent_1, ITars_1, IContext_1, IObjective_1, Objective_1, AcquireInventoryItem_1, ExecuteAction_1, Lambda_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StartFire extends Objective_1.default {
        constructor(doodad) {
            super();
            this.doodad = doodad;
        }
        getIdentifier() {
            return `StartFire:${this.doodad}`;
        }
        getStatus() {
            return `Starting a fire for ${this.doodad?.getName()}`;
        }
        async execute(context) {
            const doodad = this.doodad ?? context.getData(IContext_1.ContextDataType.LastBuiltDoodad);
            if (!doodad) {
                this.log.error("Invalid doodad");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const objectives = [];
            const description = doodad.description;
            if (!description || description.lit === undefined || description.providesFire) {
                objectives.push(new MoveToTarget_1.default(doodad, true));
            }
            else {
                if (context.island.tileEvents.getFromTile(doodad.tile, ITileEvent_1.TileEventType.Fire)) {
                    this.log.warn("Doodad already on fire?");
                    return IObjective_1.ObjectiveResult.Impossible;
                }
                const kindlingDataKey = this.getUniqueContextDataKey("Kindling");
                const tinderDataKey = this.getUniqueContextDataKey("Tinder");
                objectives.push(new AcquireInventoryItem_1.default("fireKindling", { skipHardReservedItems: true, reserveType: ITars_1.ReserveType.Hard }).setContextDataKey(kindlingDataKey));
                objectives.push(new AcquireInventoryItem_1.default("fireTinder", { skipHardReservedItems: true, reserveType: ITars_1.ReserveType.Hard }).setContextDataKey(tinderDataKey));
                objectives.push(new AcquireInventoryItem_1.default("fireStarter"));
                objectives.push(new MoveToTarget_1.default(doodad, true));
                objectives.push(new ExecuteAction_1.default(StartFire_1.default, (context) => {
                    if (!context.inventory.fireStarter?.isValid) {
                        this.log.warn("Invalid fireStarter");
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    const kindling = context.getData(kindlingDataKey);
                    if (!kindling?.isValid) {
                        this.log.warn("Invalid StartFireKindling");
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    const tinder = context.getData(tinderDataKey);
                    if (!tinder?.isValid) {
                        this.log.warn("Invalid StartFireTinder");
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    return [context.inventory.fireStarter, undefined, kindling, tinder, undefined];
                }).setStatus(this));
                objectives.push(new Lambda_1.default(async (context) => {
                    const description = doodad.description;
                    if (!description || description.lit === undefined || description.providesFire) {
                        return IObjective_1.ObjectiveResult.Complete;
                    }
                    return IObjective_1.ObjectiveResult.Restart;
                }).setStatus(this));
            }
            return objectives;
        }
    }
    exports.default = StartFire;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRGaXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0YXJ0RmlyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFtQkgsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBRS9DLFlBQTZCLE1BQWU7WUFDM0MsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBUztRQUU1QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGFBQWEsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyx1QkFBdUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3hELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDYixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO1lBQ2hDLENBQUM7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7WUFDdkMsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsR0FBRyxLQUFLLFNBQVMsSUFBSSxXQUFXLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBRS9FLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRWpELENBQUM7aUJBQU0sQ0FBQztn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