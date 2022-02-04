define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/item/IItemManager", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/doodad/AcquireBuildMoveToDoodad", "../acquire/doodad/AcquireBuildMoveToFire", "../analyze/AnalyzeBase", "../core/ExecuteAction", "../core/Lambda", "../core/MoveToTarget", "../other/doodad/StartFire"], function (require, exports, IDoodad_1, IAction_1, IItemManager_1, IObjective_1, Objective_1, AcquireBuildMoveToDoodad_1, AcquireBuildMoveToFire_1, AnalyzeBase_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, StartFire_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CompleteRequirements extends Objective_1.default {
        constructor(requirementInfo) {
            super();
            this.requirementInfo = requirementInfo;
        }
        getIdentifier() {
            return `CompleteRequirements:${this.requirementInfo.fireRequirement}:${this.requirementInfo.doodadsRequired.join(",")}`;
        }
        getStatus() {
            return "Completing requirements for a recipe";
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode() {
            return true;
        }
        async execute(context) {
            if (this.requirementInfo.doodadsRequired.length > 1) {
                this.log.warn("Requires more than a single doodad", this.requirementInfo.doodadsRequired);
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const requiresDoodads = this.requirementInfo.doodadsRequired.length > 0;
            const requiresFire = this.requirementInfo.fireRequirement !== IItemManager_1.RequirementStatus.NotRequired;
            const objectives = [];
            if (requiresDoodads && requiresFire) {
                this.log.info("Requires doodad and fire", this.requirementInfo.doodadsRequired);
                const primaryDoodad = this.requirementInfo.doodadsRequired[0];
                if (primaryDoodad !== IDoodad_1.DoodadTypeGroup.Anvil) {
                    this.log.warn("Required doodad is not an anvil", this.requirementInfo.doodadsRequired);
                    return IObjective_1.ObjectiveResult.Impossible;
                }
                const anvil = context.base.anvil[0];
                const kiln = context.base.kiln[0];
                if (!anvil) {
                    objectives.push(new AcquireBuildMoveToDoodad_1.default(primaryDoodad));
                    objectives.push(new AnalyzeBase_1.default());
                    objectives.push(new Lambda_1.default(async (context) => {
                        if (!context.base.anvil[0]) {
                            return new ExecuteAction_1.default(IAction_1.ActionType.Pickup, (context, action) => {
                                action.execute(context.actionExecutor);
                                return IObjective_1.ObjectiveResult.Complete;
                            }).setStatus("Picking up anvil to place it next to the kiln");
                        }
                        return IObjective_1.ObjectiveResult.Complete;
                    }));
                }
                if (!kiln) {
                    objectives.push(new AcquireBuildMoveToFire_1.default("kiln"));
                }
                if (kiln && anvil) {
                    objectives.push(new StartFire_1.default(kiln));
                    objectives.push(new MoveToTarget_1.default({
                        x: (kiln.x + anvil.x) / 2,
                        y: (kiln.y + anvil.y) / 2,
                        z: anvil.z,
                    }, false));
                }
            }
            else if (requiresDoodads) {
                this.log.info("Requires doodad", this.requirementInfo.doodadsRequired[0]);
                objectives.push(new AcquireBuildMoveToDoodad_1.default(this.requirementInfo.doodadsRequired[0]));
            }
            else if (requiresFire) {
                this.log.info("Requires fire");
                objectives.push(new AcquireBuildMoveToFire_1.default());
            }
            return objectives;
        }
    }
    exports.default = CompleteRequirements;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVSZXF1aXJlbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L0NvbXBsZXRlUmVxdWlyZW1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxNQUFxQixvQkFBcUIsU0FBUSxtQkFBUztRQUUxRCxZQUE2QixlQUFpQztZQUM3RCxLQUFLLEVBQUUsQ0FBQztZQURvQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFFOUQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx3QkFBd0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDekgsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHNDQUFzQyxDQUFDO1FBQy9DLENBQUM7UUFFZSx5QkFBeUI7WUFDeEMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRWUsNEJBQTRCO1lBRTNDLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNwRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUMxRixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUN4RSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsS0FBSyxnQ0FBaUIsQ0FBQyxXQUFXLENBQUM7WUFFNUYsTUFBTSxVQUFVLEdB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