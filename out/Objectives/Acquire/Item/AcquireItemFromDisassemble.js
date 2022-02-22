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
                const hashCode = this.getHashCode(true);
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
                        const requiredItemHashCode = requiredItemHashCodes[i] = `${this.getHashCode()}:${this.getUniqueIdentifier()}`;
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