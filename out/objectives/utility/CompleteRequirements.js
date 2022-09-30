define(["require", "exports", "game/doodad/IDoodad", "game/item/IItemManager", "game/entity/action/actions/PickUp", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/doodad/AcquireBuildMoveToDoodad", "../acquire/doodad/AcquireBuildMoveToFire", "../analyze/AnalyzeBase", "../core/ExecuteAction", "../core/MoveToTarget", "../other/doodad/StartFire"], function (require, exports, IDoodad_1, IItemManager_1, PickUp_1, IObjective_1, Objective_1, AcquireBuildMoveToDoodad_1, AcquireBuildMoveToFire_1, AnalyzeBase_1, ExecuteAction_1, MoveToTarget_1, StartFire_1) {
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
            if (this.requirementInfo.requirements !== IItemManager_1.RequirementStatus.Missing) {
                return IObjective_1.ObjectiveResult.Complete;
            }
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
                    objectives.push(new ExecuteAction_1.default(PickUp_1.default, (context) => {
                        if (!context.base.anvil[0]) {
                            return [];
                        }
                        return IObjective_1.ObjectiveResult.Complete;
                    }).setStatus("Picking up anvil to place it next to the kiln"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVSZXF1aXJlbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L0NvbXBsZXRlUmVxdWlyZW1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWlCQSxNQUFxQixvQkFBcUIsU0FBUSxtQkFBUztRQUUxRCxZQUE2QixlQUFpQztZQUM3RCxLQUFLLEVBQUUsQ0FBQztZQURvQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFFOUQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx3QkFBd0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDekgsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHNDQUFzQyxDQUFDO1FBQy9DLENBQUM7UUFFZSx5QkFBeUI7WUFDeEMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRWUsNEJBQTRCO1lBRTNDLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksS0FBSyxnQ0FBaUIsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3BFLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQzFGLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEdBQUcs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