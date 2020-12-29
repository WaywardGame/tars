define(["require", "exports", "doodad/IDoodad", "entity/action/IAction", "item/IItemManager", "../../IObjective", "../../Objective", "../Acquire/Doodad/AcquireBuildMoveToDoodad", "../Acquire/Doodad/AcquireBuildMoveToFire", "../Analyze/AnalyzeBase", "../Core/ExecuteAction", "../Core/Lambda", "../Core/MoveToTarget", "../Other/StartFire"], function (require, exports, IDoodad_1, IAction_1, IItemManager_1, IObjective_1, Objective_1, AcquireBuildMoveToDoodad_1, AcquireBuildMoveToFire_1, AnalyzeBase_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, StartFire_1) {
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
                            this.log.info("Picking up anvil to place it next to the kiln");
                            return new ExecuteAction_1.default(IAction_1.ActionType.Pickup, (context, action) => {
                                action.execute(context.player);
                            });
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
                this.log.info("Requires doodad");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVSZXF1aXJlbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9VdGlsaXR5L0NvbXBsZXRlUmVxdWlyZW1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLG9CQUFxQixTQUFRLG1CQUFTO1FBRTFELFlBQTZCLGVBQWlDO1lBQzdELEtBQUssRUFBRSxDQUFDO1lBRG9CLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtRQUU5RCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN6SCxDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLDRCQUE0QjtZQUVsQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDMUYsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDeEUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLEtBQUssZ0NBQWlCLENBQUMsV0FBVyxDQUFDO1lBRTVGLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsSUFBSSxlQUFlLElBQUksWUFBWSxFQUFF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