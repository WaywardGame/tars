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
                if (context.isHardReservedItem(item) || item.isProtected()) {
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