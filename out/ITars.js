define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IHuman", "game/item/IItem", "game/entity/IStats", "./utilities/Item"], function (require, exports, IDoodad_1, IAction_1, IHuman_1, IItem_1, IStats_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTarsSaveData = exports.getTarsTranslation = exports.setTarsInstance = exports.getTarsInstance = exports.ReserveType = exports.TarsMode = exports.inventoryItemInfo = exports.InventoryItemFlag = exports.baseInfo = exports.uiConfigurableOptions = exports.TarsUiSaveDataKey = exports.TarsTranslation = exports.defaultMaxTilesChecked = exports.TARS_ID = void 0;
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
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluence"] = 12] = "DialogButtonUseOrbsOfInfluence";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluenceTooltip"] = 13] = "DialogButtonUseOrbsOfInfluenceTooltip";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthy"] = 14] = "DialogButtonStayHealthy";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthyTooltip"] = 15] = "DialogButtonStayHealthyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDeveloperMode"] = 16] = "DialogButtonDeveloperMode";
        TarsTranslation[TarsTranslation["DialogButtonDeveloperModeTooltip"] = 17] = "DialogButtonDeveloperModeTooltip";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurst"] = 18] = "DialogButtonQuantumBurst";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurstTooltip"] = 19] = "DialogButtonQuantumBurstTooltip";
        TarsTranslation[TarsTranslation["DialogRangeLabel"] = 20] = "DialogRangeLabel";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThreshold"] = 21] = "DialogRangeRecoverHealthThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThresholdTooltip"] = 22] = "DialogRangeRecoverHealthThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThreshold"] = 23] = "DialogRangeRecoverStaminaThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThresholdTooltip"] = 24] = "DialogRangeRecoverStaminaThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThreshold"] = 25] = "DialogRangeRecoverHungerThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThresholdTooltip"] = 26] = "DialogRangeRecoverHungerThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThreshold"] = 27] = "DialogRangeRecoverThirstThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThresholdTooltip"] = 28] = "DialogRangeRecoverThirstThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogLabelItem"] = 29] = "DialogLabelItem";
        TarsTranslation[TarsTranslation["DialogLabelDoodad"] = 30] = "DialogLabelDoodad";
        TarsTranslation[TarsTranslation["DialogLabelGeneralOptions"] = 31] = "DialogLabelGeneralOptions";
        TarsTranslation[TarsTranslation["DialogLabelAdvancedOptions"] = 32] = "DialogLabelAdvancedOptions";
        TarsTranslation[TarsTranslation["DialogLabelRecoverThresholds"] = 33] = "DialogLabelRecoverThresholds";
        TarsTranslation[TarsTranslation["DialogModeSurvival"] = 34] = "DialogModeSurvival";
        TarsTranslation[TarsTranslation["DialogModeSurvivalTooltip"] = 35] = "DialogModeSurvivalTooltip";
        TarsTranslation[TarsTranslation["DialogModeTidyUp"] = 36] = "DialogModeTidyUp";
        TarsTranslation[TarsTranslation["DialogModeTidyUpTooltip"] = 37] = "DialogModeTidyUpTooltip";
        TarsTranslation[TarsTranslation["DialogModeGardener"] = 38] = "DialogModeGardener";
        TarsTranslation[TarsTranslation["DialogModeGardenerTooltip"] = 39] = "DialogModeGardenerTooltip";
    })(TarsTranslation = exports.TarsTranslation || (exports.TarsTranslation = {}));
    var TarsUiSaveDataKey;
    (function (TarsUiSaveDataKey) {
        TarsUiSaveDataKey[TarsUiSaveDataKey["DialogOpened"] = 0] = "DialogOpened";
        TarsUiSaveDataKey[TarsUiSaveDataKey["ActivePanelId"] = 1] = "ActivePanelId";
        TarsUiSaveDataKey[TarsUiSaveDataKey["AcquireItemDropdown"] = 2] = "AcquireItemDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["BuildDoodadDropdown"] = 3] = "BuildDoodadDropdown";
    })(TarsUiSaveDataKey = exports.TarsUiSaveDataKey || (exports.TarsUiSaveDataKey = {}));
    exports.uiConfigurableOptions = [
        TarsTranslation.DialogLabelGeneralOptions,
        {
            option: "exploreIslands",
            title: TarsTranslation.DialogButtonExploreIslands,
            tooltip: TarsTranslation.DialogButtonExploreIslandsTooltip,
        },
        {
            option: "useOrbsOfInfluence",
            title: TarsTranslation.DialogButtonUseOrbsOfInfluence,
            tooltip: TarsTranslation.DialogButtonUseOrbsOfInfluenceTooltip,
        },
        {
            option: "stayHealthy",
            title: TarsTranslation.DialogButtonStayHealthy,
            tooltip: TarsTranslation.DialogButtonStayHealthyTooltip,
        },
        TarsTranslation.DialogLabelAdvancedOptions,
        {
            option: "quantumBurst",
            title: TarsTranslation.DialogButtonQuantumBurst,
            tooltip: TarsTranslation.DialogButtonQuantumBurstTooltip,
        },
        {
            option: "developerMode",
            title: TarsTranslation.DialogButtonDeveloperMode,
            tooltip: TarsTranslation.DialogButtonDeveloperModeTooltip,
        },
        TarsTranslation.DialogLabelRecoverThresholds,
        {
            option: "recoverThresholdHealth",
            title: TarsTranslation.DialogRangeRecoverHealthThreshold,
            tooltip: TarsTranslation.DialogRangeRecoverHealthThresholdTooltip,
            slider: {
                min: 0,
                max: (context) => context.player.stat.get(IStats_1.Stat.Health).max,
            }
        },
        {
            option: "recoverThresholdStamina",
            title: TarsTranslation.DialogRangeRecoverStaminaThreshold,
            tooltip: TarsTranslation.DialogRangeRecoverStaminaThresholdTooltip,
            slider: {
                min: 0,
                max: (context) => context.player.stat.get(IStats_1.Stat.Stamina).max,
            }
        },
        {
            option: "recoverThresholdHunger",
            title: TarsTranslation.DialogRangeRecoverHungerThreshold,
            tooltip: TarsTranslation.DialogRangeRecoverHungerThresholdTooltip,
            slider: {
                min: 0,
                max: (context) => context.player.stat.get(IStats_1.Stat.Hunger).max,
            }
        },
        {
            option: "recoverThresholdThirst",
            title: TarsTranslation.DialogRangeRecoverThirstThreshold,
            tooltip: TarsTranslation.DialogRangeRecoverThirstThresholdTooltip,
            slider: {
                min: 0,
                max: (context) => context.player.stat.get(IStats_1.Stat.Thirst).max,
            }
        },
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
    var ReserveType;
    (function (ReserveType) {
        ReserveType[ReserveType["Soft"] = 0] = "Soft";
        ReserveType[ReserveType["Hard"] = 1] = "Hard";
    })(ReserveType = exports.ReserveType || (exports.ReserveType = {}));
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
    function getTarsSaveData(key) {
        return getTarsInstance().saveData[key];
    }
    exports.getTarsSaveData = getTarsSaveData;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQW1CYSxRQUFBLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFFakIsUUFBQSxzQkFBc0IsR0FBRyxJQUFJLENBQUM7SUFRM0MsSUFBWSxlQStDWDtJQS9DRCxXQUFZLGVBQWU7UUFDMUIsMkVBQWUsQ0FBQTtRQUVmLGlIQUFrQyxDQUFBO1FBRWxDLGlGQUFrQixDQUFBO1FBQ2xCLDZFQUFnQixDQUFBO1FBQ2hCLGlGQUFrQixDQUFBO1FBRWxCLGlGQUFrQixDQUFBO1FBQ2xCLHlGQUFzQixDQUFBO1FBQ3RCLHVHQUE2QixDQUFBO1FBQzdCLDJGQUF1QixDQUFBO1FBQ3ZCLHlHQUE4QixDQUFBO1FBQzlCLGtHQUEwQixDQUFBO1FBQzFCLGdIQUFpQyxDQUFBO1FBQ2pDLDBHQUE4QixDQUFBO1FBQzlCLHdIQUFxQyxDQUFBO1FBQ3JDLDRGQUF1QixDQUFBO1FBQ3ZCLDBHQUE4QixDQUFBO1FBQzlCLGdHQUF5QixDQUFBO1FBQ3pCLDhHQUFnQyxDQUFBO1FBQ2hDLDhGQUF3QixDQUFBO1FBQ3hCLDRHQUErQixDQUFBO1FBRS9CLDhFQUFnQixDQUFBO1FBQ2hCLGdIQUFpQyxDQUFBO1FBQ2pDLDhIQUF3QyxDQUFBO1FBQ3hDLGtIQUFrQyxDQUFBO1FBQ2xDLGdJQUF5QyxDQUFBO1FBQ3pDLGdIQUFpQyxDQUFBO1FBQ2pDLDhIQUF3QyxDQUFBO1FBQ3hDLGdIQUFpQyxDQUFBO1FBQ2pDLDhIQUF3QyxDQUFBO1FBRXhDLDRFQUFlLENBQUE7UUFDZixnRkFBaUIsQ0FBQTtRQUNqQixnR0FBeUIsQ0FBQTtRQUN6QixrR0FBMEIsQ0FBQTtRQUMxQixzR0FBNEIsQ0FBQTtRQUU1QixrRkFBa0IsQ0FBQTtRQUNsQixnR0FBeUIsQ0FBQTtRQUN6Qiw4RUFBZ0IsQ0FBQTtRQUNoQiw0RkFBdUIsQ0FBQTtRQUN2QixrRkFBa0IsQ0FBQTtR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