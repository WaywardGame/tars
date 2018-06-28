define(["require", "exports", "Enums", "Utilities", "../Helpers", "../IObjective", "../ITars", "../Objective"], function (require, exports, Enums_1, Utilities, Helpers, IObjective_1, ITars_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CarveCorpse extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
        }
        getHandsEquipment() {
            return {
                use: Enums_1.ActionType.Gather
            };
        }
        onExecute() {
            const moveResult = Helpers.findAndMoveToCorpse((corpse) => {
                for (const search of this.search) {
                    if (search.type === corpse.type) {
                        return true;
                    }
                }
                return false;
            });
            if (moveResult === ITars_1.MoveResult.Complete) {
                Utilities.Console.log(Enums_1.Source.Mod, "Facing matching corpse");
                const carveTool = localPlayer.canCarve();
                if (carveTool) {
                    Utilities.Console.log(Enums_1.Source.Mod, "Carving corpse");
                    actionManager.execute(localPlayer, Enums_1.ActionType.Carve, carveTool);
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                else {
                    Utilities.Console.log(Enums_1.Source.Mod, "Can't carve");
                }
            }
            else if (moveResult !== ITars_1.MoveResult.Moving) {
                Helpers.findAndMoveToCreature((c) => {
                    for (const search of this.search) {
                        if (search.type === c.type) {
                            return true;
                        }
                    }
                    return false;
                }, true);
            }
        }
    }
    exports.default = CarveCorpse;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FydmVDcmVhdHVyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0NhcnZlQ3JlYXR1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBT0EsaUJBQWlDLFNBQVEsbUJBQVM7UUFFOUMsWUFBb0IsTUFBeUI7WUFDekMsS0FBSyxFQUFFLENBQUM7WUFEUSxXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUU3QyxDQUFDO1FBRU0saUJBQWlCO1lBQ3BCLE1BQU0sQ0FBQztnQkFDSCxHQUFHLEVBQUUsa0JBQVUsQ0FBQyxNQUFNO2FBQ3pCLENBQUM7UUFDTixDQUFDO1FBRU0sU0FBUztZQUNaLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE1BQU07Z0JBQ2xELEdBQUcsQ0FBQyxDQUFDLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUMvQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDO29CQUNoQixDQUFDO2dCQUNMLENBQUM7Z0JBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxrQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQU0sQ0FBQyxHQUFHLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztnQkFFNUQsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN6QyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQU0sQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFDcEQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsa0JBQVUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQ2hFLE1BQU0sQ0FBQyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFFcEMsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFNLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNyRCxDQUFDO1lBRUwsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssa0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO29CQUM1QixHQUFHLENBQUMsQ0FBQyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDL0IsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDekIsTUFBTSxDQUFDLElBQUksQ0FBQzt3QkFDaEIsQ0FBQztvQkFDTCxDQUFDO29CQUVELE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ2pCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNiLENBQUM7UUFDTCxDQUFDO0tBRUo7SUFqREQsOEJBaURDIn0=