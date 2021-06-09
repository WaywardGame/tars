define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IEntity", "game/IGame", "game/item/IItem", "../../IObjective", "../../objectives/acquire/item/AcquireItem", "../../objectives/acquire/item/AcquireItemForAction", "../../objectives/acquire/item/AcquireItemForDoodad", "../../objectives/analyze/AnalyzeBase", "../../objectives/analyze/AnalyzeInventory", "../../objectives/core/Lambda", "../../objectives/other/item/BuildItem", "../../objectives/other/Idle", "../../objectives/other/ReturnToBase", "../../objectives/utility/OrganizeBase", "../../utilities/Base", "../../utilities/Item"], function (require, exports, IDoodad_1, IAction_1, IEntity_1, IGame_1, IItem_1, IObjective_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemForDoodad_1, AnalyzeBase_1, AnalyzeInventory_1, Lambda_1, BuildItem_1, Idle_1, ReturnToBase_1, OrganizeBase_1, Base_1, Item_1) {
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
                acquireChest = Base_1.baseUtilities.isNearBase(context);
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
                const gatherItem = Item_1.itemUtilities.getBestTool(context, IAction_1.ActionType.Gather, IEntity_1.DamageType.Slashing);
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
            const tiles = Base_1.baseUtilities.getTilesWithItemsNearBase(context);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlkeVVwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGUvbW9kZXMvVGlkeVVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUF5QkEsTUFBYSxVQUFVO1FBSWYsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFnQixFQUFFLFFBQW9CO1lBQzdELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzFCLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDaEQsTUFBTSxVQUFVLEdBQXFDLEVBQUUsQ0FBQztZQUV4RCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7WUFFeEIsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUVuQyxZQUFZLEdBQUcsb0JBQWEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7YUFFakQ7aUJBQU0sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN6QyxLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQWUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRTt3QkFDcEcsWUFBWSxHQUFHLEtBQUssQ0FBQzt3QkFDckIsTUFBTTtxQkFDTjtpQkFDRDthQUNEO1lBRUQsSUFBSSxZQUFZLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO2dCQU0xRCxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztnQkFFdEMsTUFBTSxVQUFVLEdBQUcsb0JBQWEsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsTUFBTSxFQUFFLG9CQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzlGLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtvQkFDN0IsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksOEJBQW9CLENBQUMsb0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQy9EO2dCQUVELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO29CQUMzQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksMEJBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ3BGO2dCQUVELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO29CQUMxQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSwwQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDaEY7Z0JBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7b0JBQ3hDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUM5RTtnQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksbUJBQVMsRUFBRSxFQUFFLElBQUkscUJBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN4RztZQUVELE1BQU0sS0FBSyxHQUFHLG9CQUFhLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0QsSUFBSSxLQUFLLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRTtnQkFDekIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDL0M7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksRUFBRSxDQUFDLENBQUM7WUFFcEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDL0IsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssZ0JBQVEsQ0FBQyxRQUFRLEVBQUU7b0JBQzdDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO3dCQUNyQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQ2hCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7b0JBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBRUo7cUJBQU07b0JBQ04sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGNBQUksRUFBRSxDQUFDLENBQUM7aUJBQzVCO2FBQ0Q7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBQ0Q7SUEzRUQsZ0NBMkVDIn0=