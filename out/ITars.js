define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IHuman", "game/item/IItem", "./utilities/Item"], function (require, exports, IDoodad_1, IAction_1, IHuman_1, IItem_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTarsTranslation = exports.setTarsInstance = exports.getTarsInstance = exports.TarsMode = exports.inventoryItemInfo = exports.InventoryItemFlag = exports.baseInfo = exports.uiConfigurableOptions = exports.TarsUiSaveDataKey = exports.TarsTranslation = exports.defaultMaxTilesChecked = exports.TARS_ID = void 0;
    exports.TARS_ID = "TARS";
    exports.defaultMaxTilesChecked = 3000;
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
        TarsTranslation[TarsTranslation["DialogButtonDeveloperMode"] = 16] = "DialogButtonDeveloperMode";
        TarsTranslation[TarsTranslation["DialogButtonDeveloperModeTooltip"] = 17] = "DialogButtonDeveloperModeTooltip";
        TarsTranslation[TarsTranslation["DialogLabelItem"] = 18] = "DialogLabelItem";
        TarsTranslation[TarsTranslation["DialogLabelDoodad"] = 19] = "DialogLabelDoodad";
        TarsTranslation[TarsTranslation["DialogModeSurvival"] = 20] = "DialogModeSurvival";
        TarsTranslation[TarsTranslation["DialogModeSurvivalTooltip"] = 21] = "DialogModeSurvivalTooltip";
        TarsTranslation[TarsTranslation["DialogModeTidyUp"] = 22] = "DialogModeTidyUp";
        TarsTranslation[TarsTranslation["DialogModeTidyUpTooltip"] = 23] = "DialogModeTidyUpTooltip";
        TarsTranslation[TarsTranslation["DialogModeGardener"] = 24] = "DialogModeGardener";
        TarsTranslation[TarsTranslation["DialogModeGardenerTooltip"] = 25] = "DialogModeGardenerTooltip";
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
        },
        undefined,
        {
            option: "developerMode",
            title: TarsTranslation.DialogButtonDeveloperMode,
            tooltip: TarsTranslation.DialogButtonDeveloperModeTooltip,
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
            requiredMinDur: 1,
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
            requiredMinDur: 1,
        },
        campfire: {
            itemTypes: [IItem_1.ItemTypeGroup.Campfire],
            requiredMinDur: 1,
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
            requiredMinDur: 1,
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
            requiredMinDur: 1,
        },
        hammer: {
            itemTypes: [IItem_1.ItemTypeGroup.Hammer],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Repair,
            },
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
            requiredMinDur: 1,
        },
        kiln: {
            itemTypes: [IItem_1.ItemTypeGroup.Kiln],
            requiredMinDur: 1,
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
            allowOnTiles: true,
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
            allowMultiple: 4,
        },
        waterStill: {
            itemTypes: [IItem_1.ItemTypeGroup.WaterStill],
            requiredMinDur: 1,
        },
        well: {
            itemTypes: [
                IItem_1.ItemType.ClayWell,
                IItem_1.ItemType.SandstoneWell,
                IItem_1.ItemType.StoneWell,
            ],
            requiredMinDur: 1,
        },
    };
    var TarsMode;
    (function (TarsMode) {
        TarsMode[TarsMode["Manual"] = 0] = "Manual";
        TarsMode[TarsMode["Survival"] = 1] = "Survival";
        TarsMode[TarsMode["TidyUp"] = 2] = "TidyUp";
        TarsMode[TarsMode["Gardener"] = 3] = "Gardener";
    })(TarsMode = exports.TarsMode || (exports.TarsMode = {}));
    let tars;
    function getTarsInstance() {
        if (!tars) {
            throw new Error("Invalid Tars instance");
        }
        return tars;
    }
    exports.getTarsInstance = getTarsInstance;
    function setTarsInstance(instance) {
        tars = instance;
    }
    exports.setTarsInstance = setTarsInstance;
    function getTarsTranslation(translation) {
        return getTarsInstance().getTranslation(translation);
    }
    exports.getTarsTranslation = getTarsTranslation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQWdCYSxRQUFBLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFFakIsUUFBQSxzQkFBc0IsR0FBRyxJQUFJLENBQUM7SUFFM0MsSUFBWSxlQWdDWDtJQWhDRCxXQUFZLGVBQWU7UUFDMUIsMkVBQWUsQ0FBQTtRQUVmLGlIQUFrQyxDQUFBO1FBRWxDLGlGQUFrQixDQUFBO1FBQ2xCLDZFQUFnQixDQUFBO1FBQ2hCLGlGQUFrQixDQUFBO1FBRWxCLGlGQUFrQixDQUFBO1FBQ2xCLHlGQUFzQixDQUFBO1FBQ3RCLHVHQUE2QixDQUFBO1FBQzdCLDJGQUF1QixDQUFBO1FBQ3ZCLHlHQUE4QixDQUFBO1FBQzlCLGtHQUEwQixDQUFBO1FBQzFCLGdIQUFpQyxDQUFBO1FBQ2pDLDRGQUF1QixDQUFBO1FBQ3ZCLDBHQUE4QixDQUFBO1FBQzlCLDBHQUE4QixDQUFBO1FBQzlCLHdIQUFxQyxDQUFBO1FBQ3JDLGdHQUF5QixDQUFBO1FBQ3pCLDhHQUFnQyxDQUFBO1FBRWhDLDRFQUFlLENBQUE7UUFDZixnRkFBaUIsQ0FBQTtRQUVqQixrRkFBa0IsQ0FBQTtRQUNsQixnR0FBeUIsQ0FBQTtRQUN6Qiw4RUFBZ0IsQ0FBQTtRQUNoQiw0RkFBdUIsQ0FBQTtRQUN2QixrRkFBa0IsQ0FBQTtRQUNsQixnR0FBeUIsQ0FBQTtJQUMxQixDQUFDLEVBaENXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBZ0MxQjtJQVFELElBQVksaUJBS1g7SUFMRCxXQUFZLGlCQUFpQjtRQUM1Qix5RUFBWSxDQUFBO1FBQ1osMkVBQWEsQ0FBQTtRQUNiLHVGQUFtQixDQUFBO1FBQ25CLHVGQUFtQixDQUFBO0lBQ3BCLENBQUMsRUFMVyxpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFpQixRQUs1QjtJQVlZLFFBQUEscUJBQXFCLEdBQXNIO1FBQ3ZK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