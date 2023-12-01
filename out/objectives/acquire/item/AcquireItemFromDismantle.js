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
define(["require", "exports", "@wayward/goodstream/Stream", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/entity/action/actions/Dismantle", "@wayward/game/game/item/IItem", "@wayward/game/game/item/ItemDescriptions", "@wayward/game/language/Dictionary", "@wayward/game/language/ITranslation", "@wayward/game/language/Translation", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../../utilities/ItemUtilities", "../../contextData/SetContextData", "../../core/ExecuteActionForItem", "../../core/ReserveItems", "../../utility/moveTo/MoveToLand", "./AcquireItem", "./AcquireItemByGroup"], function (require, exports, Stream_1, IAction_1, Dismantle_1, IItem_1, ItemDescriptions_1, Dictionary_1, ITranslation_1, Translation_1, IContext_1, IObjective_1, Objective_1, ItemUtilities_1, SetContextData_1, ExecuteActionForItem_1, ReserveItems_1, MoveToLand_1, AcquireItem_1, AcquireItemByGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemFromDismantle extends Objective_1.default {
        constructor(itemType, dismantleItemTypes) {
            super();
            this.itemType = itemType;
            this.dismantleItemTypes = dismantleItemTypes;
        }
        getIdentifier() {
            return `AcquireItemFromDismantle:${IItem_1.ItemType[this.itemType]}:${Array.from(this.dismantleItemTypes).map((itemType) => IItem_1.ItemType[itemType]).join(",")}`;
        }
        getStatus() {
            const translation = Stream_1.default.values(Array.from(this.dismantleItemTypes).map(itemType => Translation_1.default.nameOf(Dictionary_1.default.Item, itemType)))
                .collect(Translation_1.default.formatList, ITranslation_1.ListEnder.Or);
            return `Acquiring ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} by dismantling ${translation.getString()}`;
        }
        canIncludeContextHashCode() {
            return ItemUtilities_1.ItemUtilities.getRelatedItemTypes(this.itemType, ItemUtilities_1.RelatedItemType.Dismantle);
        }
        shouldIncludeContextHashCode(context) {
            for (const itemType of this.dismantleItemTypes) {
                if (context.isReservedItemType(itemType)) {
                    return true;
                }
            }
            return false;
        }
        async execute(context) {
            const objectivePipelines = [];
            for (const itemType of this.dismantleItemTypes) {
                const description = ItemDescriptions_1.itemDescriptions[itemType];
                if (!description || !description.dismantle) {
                    continue;
                }
                const dismantleItem = context.utilities.item.getItemInInventory(context, itemType);
                const objectives = [
                    new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
                    new SetContextData_1.default(IContext_1.ContextDataType.NextActionAllowsIntermediateChest, false),
                ];
                const itemContextDataKey = this.getUniqueContextDataKey("Dismantle");
                if (dismantleItem && context.utilities.item.canDestroyItem(context, dismantleItem)) {
                    objectives.push(new ReserveItems_1.default(dismantleItem));
                    objectives.push(new SetContextData_1.default(itemContextDataKey, dismantleItem));
                }
                else {
                    objectives.push(new AcquireItem_1.default(itemType, { willDestroyItem: true }).setContextDataKey(itemContextDataKey));
                }
                let requiredItemHashCode;
                let requiredItem;
                if (description.dismantle.required !== undefined) {
                    requiredItemHashCode = this.getUniqueContextDataKey("RequiredItem");
                    requiredItem = context.island.items.getItemForHuman(context.human, description.dismantle.required, {
                        excludeProtectedItems: true,
                        includeProtectedItemsThatWillNotBreak: IAction_1.ActionType.Dismantle,
                    });
                    if (requiredItem) {
                        objectives.push(new ReserveItems_1.default(requiredItem));
                        objectives.push(new SetContextData_1.default(requiredItemHashCode, requiredItem));
                    }
                    else {
                        objectives.push(new AcquireItemByGroup_1.default(description.dismantle.required).setContextDataKey(requiredItemHashCode));
                    }
                }
                if (context.human.isSwimming) {
                    objectives.push(new MoveToLand_1.default());
                }
                objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], {
                    genericAction: {
                        action: Dismantle_1.default,
                        args: (context) => {
                            const item = context.getData(itemContextDataKey);
                            if (!item?.isValid) {
                                return IObjective_1.ObjectiveResult.Restart;
                            }
                            let requiredItem;
                            if (requiredItemHashCode) {
                                requiredItem = context.getData(requiredItemHashCode);
                                if (requiredItem && !requiredItem.isValid) {
                                    return IObjective_1.ObjectiveResult.Restart;
                                }
                            }
                            return [item, requiredItem];
                        },
                    },
                }).passAcquireData(this).setStatus(() => `Dismantling ${Translation_1.default.nameOf(Dictionary_1.default.Item, itemType).inContext(ITranslation_1.TextContext.Lowercase).getString()} for ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()}`));
                objectivePipelines.push(objectives);
            }
            return objectivePipelines;
        }
        getBaseDifficulty(context) {
            return 5;
        }
    }
    exports.default = AcquireItemFromDismantle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gcm9tRGlzbWFudGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL0FjcXVpcmVJdGVtRnJvbURpc21hbnRsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUE2QkgsTUFBcUIsd0JBQXlCLFNBQVEsbUJBQVM7UUFFOUQsWUFBNkIsUUFBa0IsRUFBbUIsa0JBQWlDO1lBQ2xHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFlO1FBRW5HLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sNEJBQTRCLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBa0IsRUFBRSxFQUFFLENBQUMsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQy9KLENBQUM7UUFFTSxTQUFTO1lBQ2YsTUFBTSxXQUFXLEdBQUcsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUNuSSxPQUFPLENBQUMscUJBQVcsQ0FBQyxVQUFVLEVBQUUsd0JBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVoRCxPQUFPLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNB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