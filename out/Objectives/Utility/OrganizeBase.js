define(["require", "exports", "game/item/IItem", "game/tile/ITileEvent", "../../IObjective", "../../Objective", "../../utilities/Player", "../core/MoveToTarget", "../core/Restart", "../other/item/MoveItem"], function (require, exports, IItem_1, ITileEvent_1, IObjective_1, Objective_1, Player_1, MoveToTarget_1, Restart_1, MoveItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OrganizeBase extends Objective_1.default {
        constructor(tiles) {
            super();
            this.tiles = tiles;
        }
        getIdentifier() {
            return "OrganizeBase";
        }
        getStatus() {
            return "Organizing base";
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return true;
        }
        async execute(context) {
            if (this.tiles.length === 0) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const chests = context.base.chest.slice().sort((a, b) => itemManager.computeContainerWeight(a) - itemManager.computeContainerWeight(b));
            if (chests.length === 0) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectivePipelines = [];
            for (const position of this.tiles) {
                const tile = game.getTileFromPoint(position);
                if (tile.containedItems && tile.containedItems.length > 0 && !tileEventManager.get(tile, ITileEvent_1.TileEventType.Fire)) {
                    let weight = Player_1.playerUtilities.getWeight(context);
                    const maxWeight = Player_1.playerUtilities.getMaxWeight(context);
                    const itemsToMove = [];
                    for (const item of tile.containedItems) {
                        if (item.type === IItem_1.ItemType.Sailboat) {
                            continue;
                        }
                        const itemWeight = item.getTotalWeight();
                        if (weight + itemWeight <= maxWeight) {
                            weight += itemWeight;
                            itemsToMove.push(item);
                        }
                    }
                    if (itemsToMove.length === 0) {
                        continue;
                    }
                    const objectives = [];
                    objectives.push(new MoveToTarget_1.default(position, true));
                    for (const item of itemsToMove) {
                        objectives.push(new MoveItem_1.default(item, context.player.inventory));
                    }
                    objectives.push(new Restart_1.default());
                    objectivePipelines.push(objectives);
                }
            }
            return objectivePipelines;
        }
    }
    exports.default = OrganizeBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JnYW5pemVCYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9Pcmdhbml6ZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBYUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBRWxELFlBQTZCLEtBQWlCO1lBQzdDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFVBQUssR0FBTCxLQUFLLENBQVk7UUFFOUMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxjQUFjLENBQUM7UUFDdkIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGlCQUFpQixDQUFDO1FBQzFCLENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFDbkQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDNUIsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUdELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFlLENBQUMsR0FBRyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBZSxDQUFDLENBQUMsQ0FBQztZQUNwSyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLEtBQUssTUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDbEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSwwQkFBYSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUM3RyxJQUFJLE1BQU0sR0FBRyx3QkFBZSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDaEQsTUFBTSxTQUFTLEdBQUcsd0JBQWUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3hELE1BQU0sV0FBVyxHQUFXLEVBQUUsQ0FBQztvQkFFL0IsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO3dCQUN2QyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssZ0JBQVEsQ0FBQyxRQUFRLEVBQUU7NEJBRXBDLFNBQVM7eUJBQ1Q7d0JBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUN6QyxJQUFJLE1BQU0sR0FBRyxVQUFVLElBQUksU0FBUyxFQUFFOzRCQUNyQyxNQUFNLElBQUksVUFBVSxDQUFDOzRCQUNyQixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3lCQUN2QjtxQkFDRDtvQkFFRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO3dCQUM3QixTQUFTO3FCQUNUO29CQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7b0JBR3BDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUVsRCxLQUFLLE1BQU0sSUFBSSxJQUFJLFdBQVcsRUFBRTt3QkFDL0IsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGtCQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztxQkFDOUQ7b0JBS0QsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLEVBQUUsQ0FBQyxDQUFDO29CQUUvQixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBVXBDO2FBQ0Q7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FFRDtJQXpGRCwrQkF5RkMifQ==