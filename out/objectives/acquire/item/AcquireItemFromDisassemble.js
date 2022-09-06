define(["require", "exports", "@wayward/goodstream/Stream", "game/item/IItem", "language/Dictionary", "language/ITranslation", "language/Translation", "game/entity/action/actions/Disassemble", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../../utilities/Item", "../../contextData/SetContextData", "../../core/ExecuteActionForItem", "../../core/ProvideItems", "../../core/ReserveItems", "../../other/item/MoveItemIntoInventory", "../../utility/CompleteRequirements", "../../utility/moveTo/MoveToLand", "./AcquireItem", "./AcquireItemByGroup", "../../core/UseProvidedItem"], function (require, exports, Stream_1, IItem_1, Dictionary_1, ITranslation_1, Translation_1, Disassemble_1, IObjective_1, Objective_1, Item_1, SetContextData_1, ExecuteActionForItem_1, ProvideItems_1, ReserveItems_1, MoveItemIntoInventory_1, CompleteRequirements_1, MoveToLand_1, AcquireItem_1, AcquireItemByGroup_1, UseProvidedItem_1) {
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
            return Item_1.ItemUtilities.getRelatedItemTypes(this.itemType, Item_1.RelatedItemType.Disassemble);
        }
        shouldIncludeContextHashCode(context) {
            return this.searches.some(({ item }) => context.isReservedItemType(item.type));
        }
        async execute(context) {
            const objectivePipelines = [];
            for (const { item, disassemblyItems, requiredForDisassembly } of this.searches) {
                if (context.isHardReservedItem(item) || item.isProtected() || !context.utilities.item.canDestroyItem(context, item)) {
                    continue;
                }
                if (context.utilities.item.isInventoryItem(context, item)) {
                    const canDisassemble = (item === context.inventory.hoe) && (!context.inventory.axe || !context.inventory.pickAxe);
                    if (!canDisassemble) {
                        continue;
                    }
                }
                const itemContextDataKey = this.getUniqueContextDataKey("Disassemble");
                const objectives = [
                    new ReserveItems_1.default(item),
                    new ProvideItems_1.default(...disassemblyItems.map(item => item.type)),
                    new SetContextData_1.default(itemContextDataKey, item),
                    new MoveItemIntoInventory_1.default(item),
                ];
                let requiredItemHashCodes;
                if (requiredForDisassembly) {
                    requiredItemHashCodes = [];
                    for (let i = 0; i < requiredForDisassembly.length; i++) {
                        const requiredItemHashCode = requiredItemHashCodes[i] = this.getUniqueContextDataKey(`RequiredItem${i}`);
                        const itemTypeOrGroup = requiredForDisassembly[i];
                        const requiredItem = context.island.items.isGroup(itemTypeOrGroup) ?
                            context.utilities.item.getItemInContainerByGroup(context, context.human.inventory, itemTypeOrGroup, { allowInventoryItems: true }) :
                            context.utilities.item.getItemInContainer(context, context.human.inventory, itemTypeOrGroup, { allowInventoryItems: true });
                        if (requiredItem) {
                            objectives.push(new ReserveItems_1.default(requiredItem));
                            objectives.push(new SetContextData_1.default(requiredItemHashCode, requiredItem));
                        }
                        else {
                            objectives.push((context.island.items.isGroup(itemTypeOrGroup) ?
                                new AcquireItemByGroup_1.default(itemTypeOrGroup) :
                                new AcquireItem_1.default(itemTypeOrGroup)).setContextDataKey(requiredItemHashCode));
                        }
                    }
                }
                if (context.human.isSwimming()) {
                    objectives.push(new MoveToLand_1.default());
                }
                objectives.push(new CompleteRequirements_1.default(context.island.items.hasAdditionalRequirements(context.human, item.type, undefined, true)));
                objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], {
                    genericAction: {
                        action: Disassemble_1.default,
                        args: (context) => {
                            const item = context.getData(itemContextDataKey);
                            if (!item?.isValid()) {
                                return IObjective_1.ObjectiveResult.Restart;
                            }
                            let requiredItems;
                            if (requiredItemHashCodes) {
                                for (const requiredItemHashCode of requiredItemHashCodes) {
                                    const item = context.getData(requiredItemHashCode);
                                    if (!item?.isValid()) {
                                        return IObjective_1.ObjectiveResult.Restart;
                                    }
                                    requiredItems?.push(item);
                                }
                            }
                            return [item, requiredItems];
                        },
                    },
                }).passAcquireData(this).setStatus(() => `Disassembling ${item.getName().getString()}`));
                objectives.push(new UseProvidedItem_1.default(this.itemType));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gcm9tRGlzYXNzZW1ibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW1Gcm9tRGlzYXNzZW1ibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBOEJBLE1BQXFCLDBCQUEyQixTQUFRLG1CQUFTO1FBRWhFLFlBQTZCLFFBQWtCLEVBQW1CLFFBQThCO1lBQy9GLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsYUFBUSxHQUFSLFFBQVEsQ0FBc0I7UUFFaEcsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyw4QkFBOEIsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM5SCxDQUFDO1FBRU0sU0FBUztZQUNmLE1BQU0sV0FBVyxHQUFHLGdCQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7aUJBQ2hGLE9BQU8sQ0FBQyxxQkFBVyxDQUFDLFVBQVUsRUFBRSx3QkFBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRWhELE9BQU8sYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLHFCQUFxQixXQUFXLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUNsSSxDQUFDO1FBRWUseUJBQXlCO1lBQ3hDLE9BQU8sb0JB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