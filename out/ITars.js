define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IHuman", "game/item/IItem", "./utilities/Item"], function (require, exports, IDoodad_1, IAction_1, IHuman_1, IItem_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TarsMode = exports.inventoryItemInfo = exports.InventoryItemFlag = exports.baseInfo = exports.uiConfigurableOptions = exports.TarsUiSaveDataKey = exports.TarsTranslation = exports.gardenMaxTilesChecked = exports.defaultMaxTilesChecked = exports.TARS_ID = void 0;
    exports.TARS_ID = "TARS";
    exports.defaultMaxTilesChecked = 3000;
    exports.gardenMaxTilesChecked = 1024;
    var TarsTranslation;
    (function (TarsTranslation) {
        TarsTranslation[TarsTranslation["DialogTitleMain"] = 0] = "DialogTitleMain";
        TarsTranslation[TarsTranslation["DialogStatusNavigatingInitializing"] = 1] = "DialogStatusNavigatingInitializing";
        TarsTranslation[TarsTranslation["DialogPanelGeneral"] = 2] = "DialogPanelGeneral";
        TarsTranslation[TarsTranslation["DialogPanelTasks"] = 3] = "DialogPanelTasks";
        TarsTranslation[TarsTranslation["DialogPanelOptions"] = 4] = "DialogPanelOptions";
        TarsTranslation[TarsTranslation["DialogButtonEnable"] = 5] = "DialogButtonEnable";
        TarsTranslation[TarsTranslation["DialogButtonAquireItem"] = 6] = "DialogButtonAquireItem";
        TarsTranslation[TarsTranslation["DialogButtonAquireItemTooltip"] = 7] = "DialogButtonAquireItemTooltip";
        TarsTranslation[TarsTranslation["DialogButtonBuildDoodad"] = 8] = "DialogButtonBuildDoodad";
        TarsTranslation[TarsTranslation["DialogButtonBuildDoodadTooltip"] = 9] = "DialogButtonBuildDoodadTooltip";
        TarsTranslation[TarsTranslation["DialogButtonExploreIslands"] = 10] = "DialogButtonExploreIslands";
        TarsTranslation[TarsTranslation["DialogButtonExploreIslandsTooltip"] = 11] = "DialogButtonExploreIslandsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthy"] = 12] = "DialogButtonStayHealthy";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthyTooltip"] = 13] = "DialogButtonStayHealthyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluence"] = 14] = "DialogButtonUseOrbsOfInfluence";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluenceTooltip"] = 15] = "DialogButtonUseOrbsOfInfluenceTooltip";
        TarsTranslation[TarsTranslation["DialogLabelItem"] = 16] = "DialogLabelItem";
        TarsTranslation[TarsTranslation["DialogLabelDoodad"] = 17] = "DialogLabelDoodad";
        TarsTranslation[TarsTranslation["DialogModeSurvival"] = 18] = "DialogModeSurvival";
        TarsTranslation[TarsTranslation["DialogModeSurvivalTooltip"] = 19] = "DialogModeSurvivalTooltip";
        TarsTranslation[TarsTranslation["DialogModeTidyUp"] = 20] = "DialogModeTidyUp";
        TarsTranslation[TarsTranslation["DialogModeTidyUpTooltip"] = 21] = "DialogModeTidyUpTooltip";
    })(TarsTranslation = exports.TarsTranslation || (exports.TarsTranslation = {}));
    var TarsUiSaveDataKey;
    (function (TarsUiSaveDataKey) {
        TarsUiSaveDataKey[TarsUiSaveDataKey["DialogOpened"] = 0] = "DialogOpened";
        TarsUiSaveDataKey[TarsUiSaveDataKey["ActivePanelId"] = 1] = "ActivePanelId";
        TarsUiSaveDataKey[TarsUiSaveDataKey["AcquireItemDropdown"] = 2] = "AcquireItemDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["BuildDoodadDropdown"] = 3] = "BuildDoodadDropdown";
    })(TarsUiSaveDataKey = exports.TarsUiSaveDataKey || (exports.TarsUiSaveDataKey = {}));
    exports.uiConfigurableOptions = [
        {
            option: "exploreIslands",
            title: TarsTranslation.DialogButtonExploreIslands,
            tooltip: TarsTranslation.DialogButtonExploreIslandsTooltip,
        },
        {
            option: "stayHealthy",
            title: TarsTranslation.DialogButtonStayHealthy,
            tooltip: TarsTranslation.DialogButtonStayHealthyTooltip,
        },
        {
            option: "useOrbsOfInfluence",
            title: TarsTranslation.DialogButtonUseOrbsOfInfluence,
            tooltip: TarsTranslation.DialogButtonUseOrbsOfInfluenceTooltip,
        }
    ];
    exports.baseInfo = {
        anvil: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.Anvil],
            tryPlaceNear: "kiln",
        },
        campfire: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.LitCampfire],
            litType: IDoodad_1.DoodadTypeGroup.LitCampfire,
        },
        chest: {
            doodadTypes: [
                IDoodad_1.DoodadType.CopperChest,
                IDoodad_1.DoodadType.IronChest,
                IDoodad_1.DoodadType.OrnateWoodenChest,
                IDoodad_1.DoodadType.WoodenChest,
                IDoodad_1.DoodadType.WroughtIronChest,
            ],
            allowMultiple: true,
            canAdd: (base, target) => base.intermediateChest.indexOf(target) === -1,
            onAdd: (base) => {
                base.buildAnotherChest = false;
            },
        },
        furnace: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.LitFurnace],
            litType: IDoodad_1.DoodadTypeGroup.LitFurnace,
        },
        intermediateChest: {
            findTargets: (base) => {
                const sortedChests = base.chest
                    .map(chest => ({
                    chest: chest,
                    weight: itemManager.computeContainerWeight(chest),
                }))
                    .sort((a, b) => a.weight - b.weight);
                if (sortedChests.length > 0) {
                    return [base.chest.splice(base.chest.indexOf(sortedChests[0].chest), 1)[0]];
                }
                return [];
            },
        },
        kiln: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.LitKiln],
            litType: IDoodad_1.DoodadTypeGroup.LitKiln,
        },
        waterStill: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.LitWaterStill],
            litType: IDoodad_1.DoodadTypeGroup.LitWaterStill,
            allowMultiple: true,
        },
        well: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.Well],
            allowMultiple: true,
        },
    };
    var InventoryItemFlag;
    (function (InventoryItemFlag) {
        InventoryItemFlag[InventoryItemFlag["PreferHigherWorth"] = 0] = "PreferHigherWorth";
        InventoryItemFlag[InventoryItemFlag["PreferHigherActionBonus"] = 1] = "PreferHigherActionBonus";
        InventoryItemFlag[InventoryItemFlag["PreferHigherTier"] = 2] = "PreferHigherTier";
        InventoryItemFlag[InventoryItemFlag["PreferLowerWeight"] = 3] = "PreferLowerWeight";
        InventoryItemFlag[InventoryItemFlag["PreferHigherDurability"] = 4] = "PreferHigherDurability";
        InventoryItemFlag[InventoryItemFlag["PreferHigherDecay"] = 5] = "PreferHigherDecay";
    })(InventoryItemFlag = exports.InventoryItemFlag || (exports.InventoryItemFlag = {}));
    exports.inventoryItemInfo = {
        anvil: {
            itemTypes: [IItem_1.ItemTypeGroup.Anvil],
        },
        axe: {
            itemTypes: [
                IItem_1.ItemType.CopperAxe,
                IItem_1.ItemType.CopperDoubleAxe,
                IItem_1.ItemType.IronAxe,
                IItem_1.ItemType.IronDoubleAxe,
                IItem_1.ItemType.StoneAxe,
                IItem_1.ItemType.WroughtIronAxe,
                IItem_1.ItemType.WroughtIronDoubleAxe,
            ],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Gather,
            },
        },
        bandage: {
            itemTypes: [
                IItem_1.ItemType.Bandage,
                IItem_1.ItemType.PeatBandage,
                IItem_1.ItemType.CharcoalBandage,
                IItem_1.ItemType.AloeVeraBandage,
            ],
        },
        bed: {
            itemTypes: [IItem_1.ItemTypeGroup.Bedding],
        },
        campfire: {
            itemTypes: [IItem_1.ItemTypeGroup.Campfire],
        },
        carve: {
            actionTypes: [IAction_1.ActionType.Carve],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Carve,
            },
        },
        chest: {
            itemTypes: [IItem_1.ItemType.WoodenChest],
        },
        equipBack: {
            equipType: IHuman_1.EquipType.Back,
        },
        equipBelt: {
            equipType: IHuman_1.EquipType.Belt,
        },
        equipChest: {
            equipType: IHuman_1.EquipType.Chest,
        },
        equipFeet: {
            equipType: IHuman_1.EquipType.Feet,
        },
        equipHands: {
            equipType: IHuman_1.EquipType.Hands,
        },
        equipHead: {
            equipType: IHuman_1.EquipType.Head,
        },
        equipLegs: {
            equipType: IHuman_1.EquipType.Legs,
        },
        equipNeck: {
            equipType: IHuman_1.EquipType.Neck,
        },
        equipShield: {
            itemTypes: [
                IItem_1.ItemType.BarkShield,
                IItem_1.ItemType.CopperBuckler,
                IItem_1.ItemType.IronHeater,
                IItem_1.ItemType.WoodenShield,
                IItem_1.ItemType.WroughtIronShield,
            ],
            protect: true,
        },
        equipSword: {
            itemTypes: [
                IItem_1.ItemType.CopperSword,
                IItem_1.ItemType.GoldSword,
                IItem_1.ItemType.IronSword,
                IItem_1.ItemType.WoodenSword,
                IItem_1.ItemType.WroughtIronSword,
            ],
            protect: true,
        },
        fireKindling: {
            itemTypes: [IItem_1.ItemTypeGroup.Kindling],
            flags: InventoryItemFlag.PreferLowerWeight,
            allowMultiple: 5,
        },
        fireStarter: {
            itemTypes: [
                IItem_1.ItemType.BowDrill,
                IItem_1.ItemType.FirePlough,
                IItem_1.ItemType.HandDrill,
            ],
            flags: InventoryItemFlag.PreferLowerWeight,
        },
        fireTinder: {
            itemTypes: [IItem_1.ItemTypeGroup.Tinder],
            flags: InventoryItemFlag.PreferLowerWeight,
        },
        food: {
            itemTypes: Array.from(Item_1.itemUtilities.foodItemTypes),
            flags: InventoryItemFlag.PreferHigherDecay,
            allowMultiple: 5,
        },
        furnace: {
            itemTypes: [IItem_1.ItemTypeGroup.Furnace],
        },
        hammer: {
            itemTypes: [IItem_1.ItemTypeGroup.Hammer],
        },
        heal: {
            actionTypes: [IAction_1.ActionType.Heal],
        },
        hoe: {
            actionTypes: [IAction_1.ActionType.Till],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Till,
            },
        },
        intermediateChest: {
            itemTypes: [
                IItem_1.ItemType.CopperChest,
                IItem_1.ItemType.IronChest,
                IItem_1.ItemType.OrnateWoodenChest,
                IItem_1.ItemType.WoodenChest,
                IItem_1.ItemType.WroughtIronChest,
            ],
        },
        kiln: {
            itemTypes: [IItem_1.ItemTypeGroup.Kiln],
        },
        knife: {
            itemTypes: [
                IItem_1.ItemType.ObsidianKnife,
                IItem_1.ItemType.StoneKnife,
            ],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Carve,
            },
        },
        tongs: {
            itemTypes: [IItem_1.ItemTypeGroup.Tongs],
            flags: {
                flag: InventoryItemFlag.PreferHigherTier,
                option: IItem_1.ItemTypeGroup.Tongs,
            },
        },
        pickAxe: {
            itemTypes: [
                IItem_1.ItemType.CopperPickaxe,
                IItem_1.ItemType.IronPickaxe,
                IItem_1.ItemType.StonePickaxe,
                IItem_1.ItemType.WroughtIronPickaxe,
            ],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Gather,
            },
        },
        sailBoat: {
            itemTypes: [IItem_1.ItemType.Sailboat],
            allowInChests: true,
        },
        shovel: {
            actionTypes: [IAction_1.ActionType.Dig],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Dig,
            },
        },
        waterContainer: {
            actionTypes: [IAction_1.ActionType.GatherWater],
            itemTypes: [
                IItem_1.ItemTypeGroup.ContainerOfDesalinatedWater,
                IItem_1.ItemTypeGroup.ContainerOfMedicinalWater,
                IItem_1.ItemTypeGroup.ContainerOfPurifiedFreshWater,
                IItem_1.ItemTypeGroup.ContainerOfSeawater,
                IItem_1.ItemTypeGroup.ContainerOfUnpurifiedFreshWater,
            ],
            allowMultiple: 3,
        },
        waterStill: {
            itemTypes: [IItem_1.ItemTypeGroup.WaterStill],
        },
        well: {
            itemTypes: [
                IItem_1.ItemType.ClayWell,
                IItem_1.ItemType.SandstoneWell,
                IItem_1.ItemType.StoneWell,
            ],
        },
    };
    var TarsMode;
    (function (TarsMode) {
        TarsMode[TarsMode["Manual"] = 0] = "Manual";
        TarsMode[TarsMode["Survival"] = 1] = "Survival";
        TarsMode[TarsMode["TidyUp"] = 2] = "TidyUp";
    })(TarsMode = exports.TarsMode || (exports.TarsMode = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQWVhLFFBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUVqQixRQUFBLHNCQUFzQixHQUFHLElBQUksQ0FBQztJQUU5QixRQUFBLHFCQUFxQixHQUFHLElBQUksQ0FBQztJQUUxQyxJQUFZLGVBNEJYO0lBNUJELFdBQVksZUFBZTtRQUMxQiwyRUFBZSxDQUFBO1FBRWYsaUhBQWtDLENBQUE7UUFFbEMsaUZBQWtCLENBQUE7UUFDbEIsNkVBQWdCLENBQUE7UUFDaEIsaUZBQWtCLENBQUE7UUFFbEIsaUZBQWtCLENBQUE7UUFDbEIseUZBQXNCLENBQUE7UUFDdEIsdUdBQTZCLENBQUE7UUFDN0IsMkZBQXVCLENBQUE7UUFDdkIseUdBQThCLENBQUE7UUFDOUIsa0dBQTBCLENBQUE7UUFDMUIsZ0hBQWlDLENBQUE7UUFDakMsNEZBQXVCLENBQUE7UUFDdkIsMEdBQThCLENBQUE7UUFDOUIsMEdBQThCLENBQUE7UUFDOUIsd0hBQXFDLENBQUE7UUFFckMsNEVBQWUsQ0FBQTtRQUNmLGdGQUFpQixDQUFBO1FBRWpCLGtGQUFrQixDQUFBO1FBQ2xCLGdHQUF5QixDQUFBO1FBQ3pCLDhFQUFnQixDQUFBO1FBQ2hCLDRGQUF1QixDQUFBO0lBQ3hCLENBQUMsRUE1QlcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUE0QjFCO0lBUUQsSUFBWSxpQkFLWDtJQUxELFdBQVksaUJBQWlCO1FBQzVCLHlFQUFZLENBQUE7UUFDWiwyRUFBYSxDQUFBO1FBQ2IsdUZBQW1CLENBQUE7UUFDbkIsdUZBQW1CLENBQUE7SUFDcEIsQ0FBQyxFQUxXLGlCQUFpQixHQUFqQix5QkFBaUIsS0FBakIseUJBQWlCLFFBSzVCO0lBV1ksUUFBQSxxQkFBcUIsR0FBMEc7UUFDM0k7WUFDQyxNQUFNLEVBQUUsZ0JBQWdCO1lBQ3hCLEtBQUssRUFBRSxl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