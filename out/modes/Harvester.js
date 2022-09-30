define(["require", "exports", "../objectives/other/doodad/HarvestDoodads", "./BaseMode"], function (require, exports, HarvestDoodads_1, BaseMode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HarvesterMode = void 0;
    class HarvesterMode extends BaseMode_1.BaseMode {
        async initialize(_, finished) {
        }
        async determineObjectives(context) {
            const objectives = [];
            const doodads = context.utilities.object.findDoodads(context, "Harvester", doodad => doodad.canHarvest(), 10);
            if (doodads.length > 0) {
                objectives.push(...await this.getBuildAnotherChestObjectives(context));
                objectives.push(new HarvestDoodads_1.default(doodads));
            }
            return objectives;
        }
    }
    exports.HarvesterMode = HarvesterMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFydmVzdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL0hhcnZlc3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBT0EsTUFBYSxhQUFjLFNBQVEsbUJBQVE7UUFJaEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7UUFFeEUsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjtZQUM3QyxNQUFNLFVBQVUsR0FBcUMsRUFBRSxDQUFDO1lBRXhELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlHLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3BCLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUN2RSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ2hEO1lBY0QsT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQztLQUNKO0lBL0JELHNDQStCQyJ9