define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IEntity", "game/IGame", "game/item/IItem", "../../IObjective", "../../objectives/acquire/item/AcquireItem", "../../objectives/acquire/item/AcquireItemForAction", "../../objectives/acquire/item/AcquireItemForDoodad", "../../objectives/analyze/AnalyzeBase", "../../objectives/analyze/AnalyzeInventory", "../../objectives/core/Lambda", "../../objectives/other/BuildItem", "../../objectives/other/Idle", "../../objectives/other/ReturnToBase", "../../objectives/utility/OrganizeBase", "../../utilities/Base", "../../utilities/Item"], function (require, exports, IDoodad_1, IAction_1, IEntity_1, IGame_1, IItem_1, IObjective_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemForDoodad_1, AnalyzeBase_1, AnalyzeInventory_1, Lambda_1, BuildItem_1, Idle_1, ReturnToBase_1, OrganizeBase_1, Base_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TidyUpMode = void 0;
    class TidyUpMode {
        async initialize(context, finished) {
            this.finished = finished;
        }
        async determineObjectives(context) {
            const objectives = [];
            let acquireChest = true;
            if (context.base.buildAnotherChest) {
                acquireChest = Base_1.isNearBase(context);
            }
            else if (context.base.chest.length > 0) {
                for (const c of context.base.chest) {
                    if ((itemManager.computeContainerWeight(c) / itemManager.getWeightCapacity(c)) < 0.9) {
                        acquireChest = false;
                        break;
                    }
                }
            }
            if (acquireChest && context.inventory.chest === undefined) {
                context.base.buildAnotherChest = true;
                const gatherItem = Item_1.getBestTool(context, IAction_1.ActionType.Gather, IEntity_1.DamageType.Slashing);
                if (gatherItem === undefined) {
                    objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.Gather)]);
                }
                if (context.inventory.shovel === undefined) {
                    objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.Dig), new AnalyzeInventory_1.default()]);
                }
                if (context.inventory.knife === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.StoneKnife), new AnalyzeInventory_1.default()]);
                }
                if (context.inventory.axe === undefined) {
                    objectives.push([new AcquireItem_1.default(IItem_1.ItemType.StoneAxe), new AnalyzeInventory_1.default()]);
                }
                objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadType.WoodenChest), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            const tiles = Base_1.getTilesWithItemsNearBase(context);
            if (tiles.totalCount > 0) {
                objectives.push(new OrganizeBase_1.default(tiles.tiles));
            }
            objectives.push(new ReturnToBase_1.default());
            if (!multiplayer.isConnected()) {
                if (game.getTurnMode() !== IGame_1.TurnMode.RealTime) {
                    objectives.push(new Lambda_1.default(async () => {
                        this.finished();
                        return IObjective_1.ObjectiveResult.Complete;
                    }));
                }
                else {
                    objectives.push(new Idle_1.default());
                }
            }
            return objectives;
        }
    }
    exports.TidyUpMode = TidyUpMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlkeVVwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGUvbW9kZXMvVGlkeVVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUF5QkEsTUFBYSxVQUFVO1FBSWYsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFnQixFQUFFLFFBQW9CO1lBQzdELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzFCLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDaEQsTUFBTSxVQUFVLEdBQXFDLEVBQUUsQ0FBQztZQUV4RCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7WUFFeEIsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUVuQyxZQUFZLEdBQUcsaUJBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUVuQztpQkFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3pDLEtBQUssTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBZSxDQUFDLEdBQUcsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBRSxDQUFDLEdBQUcsR0FBRyxFQUFFO3dCQUNwRyxZQUFZLEdBQUcsS0FBSyxDQUFDO3dCQUNyQixNQUFNO3FCQUNOO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJLFlBQVksSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBTTFELE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO2dCQUV0QyxNQUFNLFVBQVUsR0FBRyxrQkFBVyxDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLE1BQU0sRUFBRSxvQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNoRixJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7b0JBQzdCLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMvRDtnQkFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtvQkFDM0MsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksOEJBQW9CLENBQUMsb0JBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUNwRjtnQkFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtvQkFDMUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksMEJBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ2hGO2dCQUVELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEtBQUssU0FBUyxFQUFFO29CQUN4QyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSwwQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDOUU7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksOEJBQW9CLENBQUMsb0JBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLG1CQUFTLEVBQUUsRUFBRSxJQUFJLHFCQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDeEc7WUFFRCxNQUFNLEtBQUssR0FBRyxnQ0FBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRCxJQUFJLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFO2dCQUN6QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUMvQztZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxFQUFFLENBQUMsQ0FBQztZQUVwQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUMvQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxnQkFBUSxDQUFDLFFBQVEsRUFBRTtvQkFDN0MsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7d0JBQ3JDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDaEIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztvQkFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFFSjtxQkFBTTtvQkFDTixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksY0FBSSxFQUFFLENBQUMsQ0FBQztpQkFDNUI7YUFDRDtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FDRDtJQTNFRCxnQ0EyRUMifQ==