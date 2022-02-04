define(["require", "exports", "game/item/IItem", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/MoveToTarget", "../core/Restart", "../other/item/MoveItem"], function (require, exports, IItem_1, IObjective_1, Objective_1, MoveToTarget_1, Restart_1, MoveItem_1) {
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
            const chests = context.base.chest.slice().sort((a, b) => context.island.items.computeContainerWeight(a) - context.island.items.computeContainerWeight(b));
            if (chests.length === 0) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectivePipelines = [];
            for (const position of this.tiles) {
                const tile = context.island.getTileFromPoint(position);
                if (tile.containedItems && tile.containedItems.length > 0) {
                    let weight = context.utilities.player.getWeight(context);
                    const maxWeight = context.utilities.player.getMaxWeight(context);
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
                        objectives.push(new MoveItem_1.default(item, context.human.inventory, position));
                    }
                    objectives.push(new Restart_1.default());
                    objectivePipelines.push(objectives);
                }
            }
            if (objectivePipelines.length === 0) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            return objectivePipelines;
        }
    }
    exports.default = OrganizeBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JnYW5pemVCYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9Pcmdhbml6ZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBRWxELFlBQTZCLEtBQWlCO1lBQzdDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFVBQUssR0FBTCxLQUFLLENBQVk7UUFFOUMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxjQUFjLENBQUM7UUFDdkIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGlCQUFpQixDQUFDO1FBQzFCLENBQUM7UUFFZSx5QkFBeUI7WUFDeEMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRWUsNEJBQTRCLENBQUMsT0FBZ0I7WUFDNUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDNUIsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUdELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQWUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQWUsQ0FBQyxDQUFDLENBQUM7WUFDdEwsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDeEIsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2xDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZELElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQzFELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDekQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNqRSxNQUFNLFdBQVcsR0FBVyxFQUFFLENBQUM7b0JBRS9CLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTt3QkFDdkMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLGdCQUFRLENBQUMsUUFBUSxFQUFFOzRCQUVwQyxTQUFTO3lCQUNUO3dCQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDekMsSUFBSSxNQUFNLEdBQUcsVUFBVSxJQUFJLFNBQVMsRUFBRTs0QkFDckMsTUFBTSxJQUFJLFVBQVUsQ0FBQzs0QkFDckIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt5QkFDdkI7cUJBQ0Q7b0JBRUQsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTt3QkFDN0IsU0FBUztxQkFDVDtvQkFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO29CQUdwQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFFbEQsS0FBSyxNQUFNLElBQUksSUFBSSxXQUFXLEVBQUU7d0JBQy9CLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxrQkFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO3FCQUN2RTtvQkFLRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sRUFBRSxDQUFDLENBQUM7b0JBRS9CLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFVcEM7YUFDRDtZQUVELElBQUksa0JBQWtCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDcEMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztLQUVEO0lBN0ZELCtCQTZGQyJ9