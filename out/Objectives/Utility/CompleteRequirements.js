define(["require", "exports", "doodad/IDoodad", "entity/action/IAction", "../../IObjective", "../../Objective", "../Acquire/Doodad/AcquireBuildMoveToDoodad", "../Acquire/Doodad/AcquireBuildMoveToFire", "../Analyze/AnalyzeBase", "../Core/ExecuteAction", "../Core/Lambda", "../Core/MoveToTarget", "../Other/StartFire"], function (require, exports, IDoodad_1, IAction_1, IObjective_1, Objective_1, AcquireBuildMoveToDoodad_1, AcquireBuildMoveToFire_1, AnalyzeBase_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, StartFire_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CompleteRequirements extends Objective_1.default {
        constructor(requiredDoodad, requiresFire) {
            super();
            this.requiredDoodad = requiredDoodad;
            this.requiresFire = requiresFire;
        }
        getIdentifier() {
            return `CompleteRequirements:${this.requiredDoodad}:${this.requiresFire}`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode() {
            return true;
        }
        async execute(context) {
            const objectives = [];
            if (this.requiredDoodad !== undefined && this.requiresFire) {
                this.log.info("Requires doodad and fire too", this.requiredDoodad);
                if (this.requiredDoodad !== IDoodad_1.DoodadTypeGroup.Anvil) {
                    this.log.error("Required doodad is not an anvil", this.requiredDoodad);
                    return IObjective_1.ObjectiveResult.Impossible;
                }
                const anvil = context.base.anvil[0];
                const kiln = context.base.kiln[0];
                if (!anvil) {
                    objectives.push(new AcquireBuildMoveToDoodad_1.default(this.requiredDoodad));
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
            else if (this.requiredDoodad !== undefined) {
                this.log.info("Requires doodad");
                objectives.push(new AcquireBuildMoveToDoodad_1.default(this.requiredDoodad));
            }
            else if (this.requiresFire) {
                this.log.info("Requires fire");
                objectives.push(new AcquireBuildMoveToFire_1.default());
            }
            return objectives;
        }
    }
    exports.default = CompleteRequirements;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGxldGVSZXF1aXJlbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9VdGlsaXR5L0NvbXBsZXRlUmVxdWlyZW1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWNBLE1BQXFCLG9CQUFxQixTQUFRLG1CQUFTO1FBRTFELFlBQTZCLGNBQXdELEVBQW1CLFlBQXFCO1lBQzVILEtBQUssRUFBRSxDQUFDO1lBRG9CLG1CQUFjLEdBQWQsY0FBYyxDQUEwQztZQUFtQixpQkFBWSxHQUFaLFlBQVksQ0FBUztRQUU3SCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUMzRSxDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLDRCQUE0QjtZQUVsQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUMzRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBRW5FLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyx5QkFBZSxDQUFDLEtBQUssRUFBRTtvQkFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsaUNBQWlDLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUN2RSxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2lCQUNsQztnQkFFRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRWxDLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1gsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGtDQUF3QixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO29CQUNuRSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsRUFBRSxDQUFDLENBQUM7b0JBQ25DLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTt3QkFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFOzRCQUkzQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDOzRCQUMvRCxPQUFPLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQ0FDL0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQ2hDLENBQUMsQ0FBQyxDQUFDO3lCQUNIO3dCQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7b0JBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7Z0JBRUQsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDVixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQXNCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztpQkFDcEQ7Z0JBRUQsSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO29CQUNsQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUVyQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQzt3QkFDaEMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQzt3QkFDekIsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQzt3QkFDekIsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO3FCQUNWLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDWDthQUVEO2lCQUFNLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ2pDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxrQ0FBd0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQzthQUVuRTtpQkFBTSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUMvQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQXNCLEVBQUUsQ0FBQyxDQUFDO2FBQzlDO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUVEO0lBN0VELHVDQTZFQyJ9