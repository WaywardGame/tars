define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "language/Dictionaries", "language/Translation", "game/item/IItemManager", "../../../Objective", "../../contextData/SetContextData", "../../core/ExecuteActionForItem", "../../core/ReserveItems", "../../utility/CompleteRequirements", "../../utility/MoveToLand", "../../core/ProvideItems", "../../../utilities/Item", "../../other/item/MoveItemIntoInventory", "./AcquireItem", "./AcquireItemByGroup"], function (require, exports, IAction_1, IItem_1, Dictionaries_1, Translation_1, IItemManager_1, Objective_1, SetContextData_1, ExecuteActionForItem_1, ReserveItems_1, CompleteRequirements_1, MoveToLand_1, ProvideItems_1, Item_1, MoveItemIntoInventory_1, AcquireItem_1, AcquireItemByGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemFromDisassemble extends Objective_1.default {
        constructor(itemType, searches) {
            super();
            this.itemType = itemType;
            this.searches = searches;
        }
        getIdentifier() {
            return `AcquireItemFromDisassemble:${IItem_1.ItemType[this.itemType]}:${this.searches.map(({ item }) => item.toString()).join(",")}`;
        }
        getStatus() {
            const translation = Stream.values(this.searches.map(({ item }) => item.getName()))
                .collect(Translation_1.default.formatList, Translation_1.ListEnder.Or);
            return `Acquiring ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Item, this.itemType).getString()} by disassembling ${translation.getString()}`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return this.searches.some(({ item }) => context.isReservedItemType(item.type));
        }
        async execute(context) {
            const objectivePipelines = [];
            for (const { item, disassemblyItems, requiredForDisassembly } of this.searches) {
                if (context.isHardReservedItem(item)) {
                    continue;
                }
                if (Item_1.itemUtilities.isInventoryItem(context, item)) {
                    if (item !== context.inventory.hoe || (context.inventory.axe && context.inventory.pickAxe)) {
                        continue;
                    }
                }
                const hashCode = this.getHashCode(true);
                const objectives = [
                    new ReserveItems_1.default(item),
                    new ProvideItems_1.default(...disassemblyItems.map(item => item.type)),
                    new SetContextData_1.default(hashCode, item),
                    new MoveItemIntoInventory_1.default(item),
                ];
                if (requiredForDisassembly) {
                    for (const itemTypeOfGroup of requiredForDisassembly) {
                        if (!itemManager.getItemForHuman(context.player, itemTypeOfGroup)) {
                            objectives.push(itemManager.isGroup(itemTypeOfGroup) ? new AcquireItemByGroup_1.default(itemTypeOfGroup) : new AcquireItem_1.default(itemTypeOfGroup));
                        }
                    }
                }
                if (context.player.isSwimming()) {
                    objectives.push(new MoveToLand_1.default());
                }
                const requirementInfo = itemManager.hasAdditionalRequirements(context.player, item.type, undefined, undefined, true);
                if (requirementInfo.requirements === IItemManager_1.RequirementStatus.Missing) {
                    this.log.info("Disassemble requirements not met");
                    objectives.push(new CompleteRequirements_1.default(requirementInfo));
                }
                objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], IAction_1.ActionType.Disassemble, (context, action) => {
                    const item = context.getData(hashCode);
                    if (!item) {
                        this.log.warn("Missing disassemble item. Bug in TARS pipeline, will fix itself", item, hashCode);
                        return;
                    }
                    action.execute(context.player, item);
                }).passAcquireData(this).setStatus(() => `Disassembling ${item.getName().getString()}`));
                objectivePipelines.push(objectives);
            }
            return objectivePipelines;
        }
        getBaseDifficulty(context) {
            return 5;
        }
    }
    exports.default = AcquireItemFromDisassemble;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gcm9tRGlzYXNzZW1ibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW1Gcm9tRGlzYXNzZW1ibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBMkJBLE1BQXFCLDBCQUEyQixTQUFRLG1CQUFTO1FBRWhFLFlBQTZCLFFBQWtCLEVBQW1CLFFBQThCO1lBQy9GLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsYUFBUSxHQUFSLFFBQVEsQ0FBc0I7UUFFaEcsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyw4QkFBOEIsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM5SCxDQUFDO1FBRU0sU0FBUztZQUNmLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztpQkFDaEYsT0FBTyxDQUFDLHFCQUFXLENBQUMsVUFBVSxFQUFFLHVCQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFaEQsT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLHlCQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUscUJBQXFCLFdBQVcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQ2xJLENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJ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