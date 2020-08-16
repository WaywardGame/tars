define(["require", "exports", "doodad/IDoodad", "item/IItem", "../../Objective", "../../Utilities/Object", "../../Utilities/Tile", "../Core/ExecuteActionForItem", "../Core/MoveToTarget"], function (require, exports, IDoodad_1, IItem_1, Objective_1, Object_1, Tile_1, ExecuteActionForItem_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromDoodad extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
        }
        getIdentifier() {
            return `GatherFromDoodad:${this.search.map(search => `${IDoodad_1.DoodadType[search.type]}:${IDoodad_1.GrowingStage[search.growingStage]}:${IItem_1.ItemType[search.itemType]}`).join(",")}`;
        }
        canGroupTogether() {
            return true;
        }
        async execute(context) {
            const targets = Object_1.findDoodads(context, `${this.getIdentifier()}|1`, (doodad) => {
                var _a, _b;
                const description = doodad.description();
                if (!description) {
                    return false;
                }
                const growingStage = doodad.getGrowingStage();
                if (growingStage === undefined || (((_a = description.gather) === null || _a === void 0 ? void 0 : _a[growingStage]) === undefined && ((_b = description.harvest) === null || _b === void 0 ? void 0 : _b[growingStage]) === undefined)) {
                    return false;
                }
                return this.search.findIndex(search => search.type === doodad.type && search.growingStage === growingStage) !== -1 && Tile_1.canGather(doodad.getTile(), true);
            }, 5);
            return targets.map(target => {
                const objectives = [];
                objectives.push(new MoveToTarget_1.default(target, true));
                objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Doodad, this.search.map(search => search.itemType)).passContextDataKey(this));
                return objectives;
            });
        }
        getBaseDifficulty(context) {
            return 20;
        }
    }
    exports.default = GatherFromDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbURvb2RhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0dhdGhlci9HYXRoZXJGcm9tRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWFBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBRXRELFlBQTZCLE1BQXNCO1lBQ2xELEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQWdCO1FBRW5ELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sb0JBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxvQkFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxnQkFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDbEssQ0FBQztRQUVNLGdCQUFnQjtZQUN0QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sT0FBTyxHQUFHLG9CQUFXLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxNQUFjLEVBQUUsRUFBRTs7Z0JBQ3BGLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDakIsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLFlBQVksS0FBSyxTQUFTLElBQUksQ0FBQyxPQUFBLFdBQVcsQ0FBQyxNQUFNLDBDQUFHLFlBQVksT0FBTSxTQUFTLElBQUksT0FBQSxXQUFXLENBQUMsT0FBTywwQ0FBRyxZQUFZLE9BQU0sU0FBUyxDQUFDLEVBQUU7b0JBQzFJLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFlBQVksS0FBSyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxnQkFBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6SixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFHTixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzNCLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7Z0JBRXBDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsd0NBQWlCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFekksT0FBTyxVQUFVLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVMsaUJBQWlCLENBQUMsT0FBZ0I7WUFDM0MsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO0tBRUQ7SUE3Q0QsbUNBNkNDIn0=