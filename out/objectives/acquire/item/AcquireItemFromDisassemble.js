/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "@wayward/goodstream/Stream", "@wayward/game/game/entity/action/actions/Disassemble", "@wayward/game/game/item/IItem", "@wayward/game/language/Dictionary", "@wayward/game/language/ITranslation", "@wayward/game/language/Translation", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../../utilities/ItemUtilities", "../../contextData/SetContextData", "../../core/ExecuteActionForItem", "../../core/ProvideItems", "../../core/ReserveItems", "../../core/UseProvidedItem", "../../other/item/MoveItemIntoInventory", "../../utility/CompleteRequirements", "../../utility/moveTo/MoveToLand", "./AcquireItem", "./AcquireItemByGroup"], function (require, exports, Stream_1, Disassemble_1, IItem_1, Dictionary_1, ITranslation_1, Translation_1, IObjective_1, Objective_1, ItemUtilities_1, SetContextData_1, ExecuteActionForItem_1, ProvideItems_1, ReserveItems_1, UseProvidedItem_1, MoveItemIntoInventory_1, CompleteRequirements_1, MoveToLand_1, AcquireItem_1, AcquireItemByGroup_1) {
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
            return ItemUtilities_1.ItemUtilities.getRelatedItemTypes(this.itemType, ItemUtilities_1.RelatedItemType.Disassemble);
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
                if (context.human.isSwimming) {
                    objectives.push(new MoveToLand_1.default());
                }
                objectives.push(new CompleteRequirements_1.default(context.island.items.hasAdditionalRequirements(context.human, item.type, undefined, true)));
                objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], {
                    genericAction: {
                        action: Disassemble_1.default,
                        args: (context) => {
                            const item = context.getData(itemContextDataKey);
                            if (!item?.isValid) {
                                return IObjective_1.ObjectiveResult.Restart;
                            }
                            let requiredItems;
                            if (requiredItemHashCodes) {
                                for (const requiredItemHashCode of requiredItemHashCodes) {
                                    const item = context.getData(requiredItemHashCode);
                                    if (!item?.isValid) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gcm9tRGlzYXNzZW1ibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW1Gcm9tRGlzYXNzZW1ibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBZ0NILE1BQXFCLDBCQUEyQixTQUFRLG1CQUFTO1FBRWhFLFlBQTZCLFFBQWtCLEVBQW1CLFFBQThCO1lBQy9GLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsYUFBUSxHQUFSLFFBQVEsQ0FBc0I7UUFFaEcsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyw4QkFBOEIsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM5SCxDQUFDO1FBRU0sU0FBUztZQUNmLE1BQU0sV0FBVyxHQUFHLGdCQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7aUJBQ2hGLE9BQU8sQ0FBQyxxQkFBVyxDQUFDLFVBQVUsRUFBRSx3QkFBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRWhELE9BQU8sYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLHFCQUFxQixXQUFXLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUNsSSxDQUFDO1FBRWUseUJB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