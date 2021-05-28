define(["require", "exports", "game/entity/action/IAction", "../../IObjective", "../../Objective", "../core/ExecuteAction", "../core/MoveToTarget"], function (require, exports, IAction_1, IObjective_1, Objective_1, ExecuteAction_1, MoveToTarget_1) {
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
            const objectives = [];
            for (const position of this.tiles) {
                const tile = game.getTileFromPoint(position);
                if (tile.containedItems && tile.containedItems.length > 0) {
                    objectives.push(new MoveToTarget_1.default(position, true));
                    for (const item of tile.containedItems) {
                        objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                            action.execute(context.player, item, context.player.inventory);
                        }));
                    }
                    objectives.push(new MoveToTarget_1.default(chests[0], true));
                    for (const item of tile.containedItems) {
                        objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                            action.execute(context.player, item, chests[0]);
                        }));
                    }
                }
            }
            return objectives;
        }
        static moveIntoChestObjectives(chest, itemsToMove) {
            const targetContainer = chest;
            const weight = itemManager.computeContainerWeight(targetContainer);
            if (weight + itemsToMove[0].getTotalWeight() <= itemManager.getWeightCapacity(targetContainer)) {
                const objectives = [];
                objectives.push(new MoveToTarget_1.default(chest, true));
                for (const item of itemsToMove) {
                    objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                        action.execute(context.player, item, targetContainer);
                    }));
                }
                return objectives;
            }
            return undefined;
        }
    }
    exports.default = OrganizeBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JnYW5pemVCYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9Pcmdhbml6ZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBRWxELFlBQTZCLEtBQWlCO1lBQzdDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFVBQUssR0FBTCxLQUFLLENBQVk7UUFFOUMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxjQUFjLENBQUM7UUFDdkIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGlCQUFpQixDQUFDO1FBQzFCLENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFDbkQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDNUIsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUdELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFlLENBQUMsR0FBRyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBZSxDQUFDLENBQUMsQ0FBQztZQUNwSyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2xD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