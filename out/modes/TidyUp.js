define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IEntity", "game/IGame", "game/item/IItem", "../core/objective/IObjective", "../objectives/acquire/item/AcquireItem", "../objectives/acquire/item/AcquireItemForAction", "../objectives/acquire/item/AcquireItemForDoodad", "../objectives/analyze/AnalyzeBase", "../objectives/analyze/AnalyzeInventory", "../objectives/core/Lambda", "../objectives/other/item/BuildItem", "../objectives/other/Idle", "../objectives/other/ReturnToBase", "../objectives/utility/OrganizeBase", "../objectives/utility/OrganizeInventory"], function (require, exports, IDoodad_1, IAction_1, IEntity_1, IGame_1, IItem_1, IObjective_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemForDoodad_1, AnalyzeBase_1, AnalyzeInventory_1, Lambda_1, BuildItem_1, Idle_1, ReturnToBase_1, OrganizeBase_1, OrganizeInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TidyUpMode = void 0;
    class TidyUpMode {
        async initialize(_, finished) {
            this.finished = finished;
        }
        async determineObjectives(context) {
            const objectives = [];
            if (!context.base.buildAnotherChest) {
                context.base.buildAnotherChest = true;
                if (context.base.chest.length > 0) {
                    for (const c of context.base.chest) {
                        if ((context.human.island.items.computeContainerWeight(c) / context.human.island.items.getWeightCapacity(c)) < 0.9) {
                            context.base.buildAnotherChest = false;
                            break;
                        }
                    }
                }
            }
            if (context.base.buildAnotherChest && context.inventory.chest === undefined) {
                context.base.buildAnotherChest = true;
                const chopItem = context.utilities.item.getBestTool(context, IAction_1.ActionType.Chop, IEntity_1.DamageType.Slashing);
                if (chopItem === undefined) {
                    objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.Chop)]);
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
            const tiles = context.utilities.base.getTilesWithItemsNearBase(context);
            if (tiles.totalCount > 0) {
                objectives.push(new OrganizeBase_1.default(tiles.tiles));
            }
            objectives.push(new ReturnToBase_1.default());
            objectives.push(new OrganizeInventory_1.default());
            if (!multiplayer.isConnected()) {
                if (game.getTurnMode() !== IGame_1.TurnMode.RealTime) {
                    objectives.push(new Lambda_1.default(async () => {
                        this.finished(true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlkeVVwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL1RpZHlVcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBMEJBLE1BQWEsVUFBVTtRQUlmLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9DO1lBQ3ZFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzFCLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDaEQsTUFBTSxVQUFVLEdBQXFDLEVBQUUsQ0FBQztZQUV4RCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7Z0JBRXRDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDbEMsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFlLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFFLENBQUMsR0FBRyxHQUFHLEVBQUU7NEJBQ2xJLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDOzRCQUN2QyxNQUFNO3lCQUNOO3FCQUNEO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO2dCQU01RSxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztnQkFFdEMsTUFBTSxRQUFRLEdB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