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
define(["require", "exports", "@wayward/game/game/entity/action/actions/StokeFire", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget", "../../../core/ITars", "../../acquire/item/AcquireInventoryItem", "../../core/ExecuteAction", "./StartFire"], function (require, exports, StokeFire_1, IContext_1, IObjective_1, Objective_1, MoveToTarget_1, ITars_1, AcquireInventoryItem_1, ExecuteAction_1, StartFire_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StokeFire extends Objective_1.default {
        constructor(doodad, numberOfStokes = 0) {
            super();
            this.doodad = doodad;
            this.numberOfStokes = numberOfStokes;
        }
        getIdentifier() {
            return `StokeFire:${this.doodad}:${this.numberOfStokes}`;
        }
        getStatus() {
            return `Stoking ${this.doodad?.getName()}`;
        }
        async execute(context) {
            const doodad = this.doodad ?? context.getData(IContext_1.ContextDataType.LastBuiltDoodad);
            if (!doodad) {
                this.log.error("Invalid doodad");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const itemContextDataKey = this.getUniqueContextDataKey("Kindling");
            const objectives = [];
            const description = doodad.description;
            if (description && !description.providesFire) {
                objectives.push(new StartFire_1.default(doodad));
            }
            objectives.push(new AcquireInventoryItem_1.default("fireKindling", { skipHardReservedItems: true, reserveType: ITars_1.ReserveType.Hard, desiredCount: this.numberOfStokes }).setContextDataKey(itemContextDataKey));
            objectives.push(new MoveToTarget_1.default(doodad, true));
            objectives.push(new ExecuteAction_1.default(StokeFire_1.default, (context) => {
                const kindling = context.getData(itemContextDataKey);
                if (!kindling?.isValid) {
                    this.log.warn("Invalid StokeFire kindling");
                    return IObjective_1.ObjectiveResult.Restart;
                }
                return [kindling];
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = StokeFire;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Rva2VGaXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0b2tlRmlyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFtQkgsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBRS9DLFlBQTZCLE1BQWUsRUFBbUIsaUJBQXlCLENBQUM7WUFDeEYsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBUztZQUFtQixtQkFBYyxHQUFkLGNBQWMsQ0FBWTtRQUV6RixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGFBQWEsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDMUQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFdBQVcsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzVDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDYixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO1lBQ2hDLENBQUM7WUFFRCxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUVwRSxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7WUFDdkMsSUFBSSxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQzlDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxjQUFjLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLG1CQUFXLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFFbk0sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFaEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsbUJBQWUsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUM5RCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFPLGtCQUFrQixDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUM7b0JBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7b0JBQzVDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7Z0JBQ2hDLENBQUM7Z0JBRUQsT0FBTyxDQUFDLFFBQVEsQ0FBOEMsQ0FBQztZQUNoRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVwQixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUEvQ0QsNEJBK0NDIn0=