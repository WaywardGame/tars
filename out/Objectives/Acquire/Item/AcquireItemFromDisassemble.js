define(["require", "exports", "@wayward/goodstream/Stream", "game/entity/action/IAction", "game/item/IItem", "game/item/IItemManager", "language/Dictionary", "language/ITranslation", "language/Translation", "../../../core/objective/Objective", "../../../utilities/Item", "../../contextData/SetContextData", "../../core/ExecuteActionForItem", "../../core/ProvideItems", "../../core/ReserveItems", "../../other/item/MoveItemIntoInventory", "../../utility/CompleteRequirements", "../../utility/moveTo/MoveToLand", "./AcquireItem", "./AcquireItemByGroup"], function (require, exports, Stream_1, IAction_1, IItem_1, IItemManager_1, Dictionary_1, ITranslation_1, Translation_1, Objective_1, Item_1, SetContextData_1, ExecuteActionForItem_1, ProvideItems_1, ReserveItems_1, MoveItemIntoInventory_1, CompleteRequirements_1, MoveToLand_1, AcquireItem_1, AcquireItemByGroup_1) {
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
            const translation = Stream_1.default.values(this.searches.map(({ item }) => item.getName()))
                .collect(Translation_1.default.formatList, ITranslation_1.ListEnder.Or);
            return `Acquiring ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} by disassembling ${translation.getString()}`;
        }
        canIncludeContextHashCode() {
            return Item_1.ItemUtilities.getRelatedItemTypes(this.itemType);
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
                if (context.utilities.item.isInventoryItem(context, item)) {
                    const canDisassemble = (item === context.inventory.hoe) && (!context.inventory.axe || !context.inventory.pickAxe);
                    if (!canDisassemble) {
                        continue;
                    }
                }
                const hashCode = this.getHashCode(context, true);
                const objectives = [
                    new ReserveItems_1.default(item),
                    new ProvideItems_1.default(...disassemblyItems.map(item => item.type)),
                    new SetContextData_1.default(hashCode, item),
                    new MoveItemIntoInventory_1.default(item),
                ];
                let requiredItemHashCodes;
                if (requiredForDisassembly) {
                    requiredItemHashCodes = [];
                    for (let i = 0; i < requiredForDisassembly.length; i++) {
                        const requiredItemHashCode = requiredItemHashCodes[i] = `${this.getHashCode(context)}:${this.getUniqueIdentifier()}`;
                        const itemTypeOrGroup = requiredForDisassembly[i];
                        const requiredItem = context.island.items.isGroup(itemTypeOrGroup) ?
                            context.utilities.item.getItemInContainerByGroup(context, context.human.inventory, itemTypeOrGroup, true) :
                            context.utilities.item.getItemInContainer(context, context.human.inventory, itemTypeOrGroup, true);
                        if (requiredItem === undefined) {
                            objectives.push((context.island.items.isGroup(itemTypeOrGroup) ?
                                new AcquireItemByGroup_1.default(itemTypeOrGroup) :
                                new AcquireItem_1.default(itemTypeOrGroup)).setContextDataKey(requiredItemHashCode));
                        }
                        else {
                            objectives.push(new ReserveItems_1.default(requiredItem));
                            objectives.push(new SetContextData_1.default(requiredItemHashCode, requiredItem));
                        }
                    }
                }
                if (context.human.isSwimming()) {
                    objectives.push(new MoveToLand_1.default());
                }
                const requirementInfo = context.island.items.hasAdditionalRequirements(context.human, item.type, undefined, undefined, true);
                if (requirementInfo.requirements === IItemManager_1.RequirementStatus.Missing) {
                    this.log.info("Disassemble requirements not met");
                    objectives.push(new CompleteRequirements_1.default(requirementInfo));
                }
                objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], {
                    actionType: IAction_1.ActionType.Disassemble,
                    executor: (context, action) => {
                        const item = context.getData(hashCode);
                        if (!item?.isValid()) {
                            this.log.warn(`Missing disassemble item "${item}". Bug in TARS pipeline, will fix itself. Hash code: ${hashCode}`);
                            return;
                        }
                        let requiredItems;
                        if (requiredItemHashCodes) {
                            for (const requiredItemHashCode of requiredItemHashCodes) {
                                const item = context.getData(requiredItemHashCode);
                                if (!item?.isValid()) {
                                    this.log.warn(`Missing required item "${item}" for disassembly. Bug in TARS pipeline, will fix itself. Hash code: ${requiredItemHashCode}`);
                                    return;
                                }
                                requiredItems?.push(item);
                            }
                        }
                        action.execute(context.actionExecutor, item, requiredItems);
                    },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gcm9tRGlzYXNzZW1ibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW1Gcm9tRGlzYXNzZW1ibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBNEJBLE1BQXFCLDBCQUEyQixTQUFRLG1CQUFTO1FBRWhFLFlBQTZCLFFBQWtCLEVBQW1CLFFBQThCO1lBQy9GLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsYUFBUSxHQUFSLFFBQVEsQ0FBc0I7UUFFaEcsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyw4QkFBOEIsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM5SCxDQUFDO1FBRU0sU0FBUztZQUNmLE1BQU0sV0FBVyxHQUFHLGdCQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7aUJBQ2hGLE9BQU8sQ0FBQyxxQkFBVyxDQUFDLFVBQVUsRUFBRSx3QkFBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRWhELE9BQU8sYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLHFCQUFxQixXQUFXLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUNsSSxDQUFDO1FBRWUseUJBQXlCO1lBQ3hDLE9BQU8sb0JB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