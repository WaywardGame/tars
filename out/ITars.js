define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IHuman", "game/entity/IStats", "game/item/IItem", "./utilities/Item"], function (require, exports, IDoodad_1, IAction_1, IHuman_1, IStats_1, IItem_1, Item_1) {
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
        TarsTranslation[TarsTranslation["DialogPanelMoveTo"] = 4] = "DialogPanelMoveTo";
        TarsTranslation[TarsTranslation["DialogPanelOptions"] = 5] = "DialogPanelOptions";
        TarsTranslation[TarsTranslation["DialogButtonEnable"] = 6] = "DialogButtonEnable";
        TarsTranslation[TarsTranslation["DialogButtonAquireItem"] = 7] = "DialogButtonAquireItem";
        TarsTranslation[TarsTranslation["DialogButtonAquireItemTooltip"] = 8] = "DialogButtonAquireItemTooltip";
        TarsTranslation[TarsTranslation["DialogButtonBuildDoodad"] = 9] = "DialogButtonBuildDoodad";
        TarsTranslation[TarsTranslation["DialogButtonBuildDoodadTooltip"] = 10] = "DialogButtonBuildDoodadTooltip";
        TarsTranslation[TarsTranslation["DialogButtonExploreIslands"] = 11] = "DialogButtonExploreIslands";
        TarsTranslation[TarsTranslation["DialogButtonExploreIslandsTooltip"] = 12] = "DialogButtonExploreIslandsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluence"] = 13] = "DialogButtonUseOrbsOfInfluence";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluenceTooltip"] = 14] = "DialogButtonUseOrbsOfInfluenceTooltip";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthy"] = 15] = "DialogButtonStayHealthy";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthyTooltip"] = 16] = "DialogButtonStayHealthyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDeveloperMode"] = 17] = "DialogButtonDeveloperMode";
        TarsTranslation[TarsTranslation["DialogButtonDeveloperModeTooltip"] = 18] = "DialogButtonDeveloperModeTooltip";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurst"] = 19] = "DialogButtonQuantumBurst";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurstTooltip"] = 20] = "DialogButtonQuantumBurstTooltip";
        TarsTranslation[TarsTranslation["DialogButtonMoveToBase"] = 21] = "DialogButtonMoveToBase";
        TarsTranslation[TarsTranslation["DialogButtonMoveToDoodad"] = 22] = "DialogButtonMoveToDoodad";
        TarsTranslation[TarsTranslation["DialogButtonMoveToIsland"] = 23] = "DialogButtonMoveToIsland";
        TarsTranslation[TarsTranslation["DialogButtonMoveToNPC"] = 24] = "DialogButtonMoveToNPC";
        TarsTranslation[TarsTranslation["DialogButtonMoveToPlayer"] = 25] = "DialogButtonMoveToPlayer";
        TarsTranslation[TarsTranslation["DialogButtonMoveToTerrain"] = 26] = "DialogButtonMoveToTerrain";
        TarsTranslation[TarsTranslation["DialogRangeLabel"] = 27] = "DialogRangeLabel";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThreshold"] = 28] = "DialogRangeRecoverHealthThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThresholdTooltip"] = 29] = "DialogRangeRecoverHealthThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThreshold"] = 30] = "DialogRangeRecoverStaminaThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThresholdTooltip"] = 31] = "DialogRangeRecoverStaminaThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThreshold"] = 32] = "DialogRangeRecoverHungerThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThresholdTooltip"] = 33] = "DialogRangeRecoverHungerThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThreshold"] = 34] = "DialogRangeRecoverThirstThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThresholdTooltip"] = 35] = "DialogRangeRecoverThirstThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogLabelAdvanced"] = 36] = "DialogLabelAdvanced";
        TarsTranslation[TarsTranslation["DialogLabelDoodad"] = 37] = "DialogLabelDoodad";
        TarsTranslation[TarsTranslation["DialogLabelGeneral"] = 38] = "DialogLabelGeneral";
        TarsTranslation[TarsTranslation["DialogLabelIsland"] = 39] = "DialogLabelIsland";
        TarsTranslation[TarsTranslation["DialogLabelItem"] = 40] = "DialogLabelItem";
        TarsTranslation[TarsTranslation["DialogLabelNPC"] = 41] = "DialogLabelNPC";
        TarsTranslation[TarsTranslation["DialogLabelPlayer"] = 42] = "DialogLabelPlayer";
        TarsTranslation[TarsTranslation["DialogLabelRecoverThresholds"] = 43] = "DialogLabelRecoverThresholds";
        TarsTranslation[TarsTranslation["DialogLabelTerrain"] = 44] = "DialogLabelTerrain";
        TarsTranslation[TarsTranslation["DialogModeSurvival"] = 45] = "DialogModeSurvival";
        TarsTranslation[TarsTranslation["DialogModeSurvivalTooltip"] = 46] = "DialogModeSurvivalTooltip";
        TarsTranslation[TarsTranslation["DialogModeTidyUp"] = 47] = "DialogModeTidyUp";
        TarsTranslation[TarsTranslation["DialogModeTidyUpTooltip"] = 48] = "DialogModeTidyUpTooltip";
        TarsTranslation[TarsTranslation["DialogModeGardener"] = 49] = "DialogModeGardener";
        TarsTranslation[TarsTranslation["DialogModeGardenerTooltip"] = 50] = "DialogModeGardenerTooltip";
        TarsTranslation[TarsTranslation["DialogModeTerminator"] = 51] = "DialogModeTerminator";
        TarsTranslation[TarsTranslation["DialogModeTerminatorTooltip"] = 52] = "DialogModeTerminatorTooltip";
        TarsTranslation[TarsTranslation["DialogModeQuest"] = 53] = "DialogModeQuest";
        TarsTranslation[TarsTranslation["DialogModeQuestTooltip"] = 54] = "DialogModeQuestTooltip";
    })(TarsTranslation = exports.TarsTranslation || (exports.TarsTranslation = {}));
    var TarsUiSaveDataKey;
    (function (TarsUiSaveDataKey) {
        TarsUiSaveDataKey[TarsUiSaveDataKey["DialogOpened"] = 0] = "DialogOpened";
        TarsUiSaveDataKey[TarsUiSaveDataKey["ActivePanelId"] = 1] = "ActivePanelId";
        TarsUiSaveDataKey[TarsUiSaveDataKey["AcquireItemDropdown"] = 2] = "AcquireItemDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["BuildDoodadDropdown"] = 3] = "BuildDoodadDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToIslandDropdown"] = 4] = "MoveToIslandDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToTerrainDropdown"] = 5] = "MoveToTerrainDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToDoodadDropdown"] = 6] = "MoveToDoodadDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToPlayerDropdown"] = 7] = "MoveToPlayerDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToNPCDropdown"] = 8] = "MoveToNPCDropdown";
    })(TarsUiSaveDataKey = exports.TarsUiSaveDataKey || (exports.TarsUiSaveDataKey = {}));
    exports.uiConfigurableOptions = [
        TarsTranslation.DialogLabelGeneral,
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
        TarsTranslation.DialogLabelAdvanced,
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
            findTargets: (context) => {
                const sortedChests = context.base.chest
                    .map(chest => ({
                    chest: chest,
                    weight: context.island.items.computeContainerWeight(chest),
                }))
                    .sort((a, b) => a.weight - b.weight);
                if (sortedChests.length > 0) {
                    return [context.base.chest.splice(context.base.chest.indexOf(sortedChests[0].chest), 1)[0]];
                }
                return [];
            },
        },
        kiln: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.LitKiln],
            litType: IDoodad_1.DoodadTypeGroup.LitKiln,
            tryPlaceNear: "anvil",
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
                option: IAction_1.ActionType.Chop,
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
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Sleep,
            },
        },
        campfire: {
            itemTypes: [IItem_1.ItemTypeGroup.Campfire],
            requiredMinDur: 1,
        },
        butcher: {
            actionTypes: [IAction_1.ActionType.Butcher],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Butcher,
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
            itemTypes: () => Array.from(Item_1.itemUtilities.foodItemTypes),
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
                option: IAction_1.ActionType.Butcher,
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
                option: IAction_1.ActionType.Mine,
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
            actionTypes: [IAction_1.ActionType.GatherLiquid],
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
        TarsMode[TarsMode["Terminator"] = 4] = "Terminator";
        TarsMode[TarsMode["Quest"] = 5] = "Quest";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQW9CYSxRQUFBLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFFakIsUUFBQSxzQkFBc0IsR0FBRyxJQUFJLENBQUM7SUFRM0MsSUFBWSxlQStEWDtJQS9ERCxXQUFZLGVBQWU7UUFDMUIsMkVBQWUsQ0FBQTtRQUVmLGlIQUFrQyxDQUFBO1FBRWxDLGlGQUFrQixDQUFBO1FBQ2xCLDZFQUFnQixDQUFBO1FBQ2hCLCtFQUFpQixDQUFBO1FBQ2pCLGlGQUFrQixDQUFBO1FBRWxCLGlGQUFrQixDQUFBO1FBQ2xCLHlGQUFzQixDQUFBO1FBQ3RCLHVHQUE2QixDQUFBO1FBQzdCLDJGQUF1QixDQUFBO1FBQ3ZCLDBHQUE4QixDQUFBO1FBQzlCLGtHQUEwQixDQUFBO1FBQzFCLGdIQUFpQyxDQUFBO1FBQ2pDLDBHQUE4QixDQUFBO1FBQzlCLHdIQUFxQyxDQUFBO1FBQ3JDLDRGQUF1QixDQUFBO1FBQ3ZCLDBHQUE4QixDQUFBO1FBQzlCLGdHQUF5QixDQUFBO1FBQ3pCLDhHQUFnQyxDQUFBO1FBQ2hDLDhGQUF3QixDQUFBO1FBQ3hCLDRHQUErQixDQUFBO1FBRS9CLDBGQUFzQixDQUFBO1FBQ3RCLDhGQUF3QixDQUFBO1FBQ3hCLDhGQUF3QixDQUFBO1FBQ3hCLHdGQUFxQixDQUFBO1FBQ3JCLDhGQUF3QixDQUFBO1FBQ3hCLGdHQUF5QixDQUFBO1FBRXpCLDhFQUFnQixDQUFBO1FBQ2hCLGdIQUFpQyxDQUFBO1FBQ2pDLDhIQUF3QyxDQUFBO1FBQ3hDLGtIQUFrQyxDQUFBO1FBQ2xDLGdJQUF5QyxDQUFBO1FBQ3pDLGdIQUFpQyxDQUFBO1FBQ2pDLDhIQUF3QyxDQUFBO1FBQ3hDLGdIQUFpQyxDQUFBO1FBQ2pDLDhIQUF3QyxDQUFBO1FBRXhDLG9GQUFtQixDQUFBO1FBQ25CLGdGQUFpQixDQUFBO1FBQ2pCLGtGQUFrQixDQUFBO1FBQ2xCLGdGQUFpQixDQUFBO1FBQ2pCLDRFQUFlLENBQUE7UUFDZiwwRUFBYyxDQUFBO1FBQ2QsZ0ZBQWlCLENBQUE7UUFDakIsc0dBQTRCLENBQUE7UUFDNUIsa0ZBQWtCLENBQUE7UUFFbEIsa0ZBQWtCLENBQUE7UUFDbEIsZ0dBQXlCLENBQUE7UUFDekIsOEVBQWdCLENBQUE7UUFDaEIsNEZBQXVCLENBQUE7UUFDdkIsa0ZBQWtCLENBQUE7UUFDbEIsZ0dBQXlCLENBQUE7UUFDekIsc0ZBQW9CLENBQUE7UUFDcEIsb0dBQTJCLENBQUE7UUFDM0IsNEVBQWUsQ0FBQTtRQUNmLDBGQUFzQixDQUFBO0lBQ3ZCLENBQUMsRUEvRFcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUErRDFCO0lBVUQsSUFBWSxpQkFVWDtJQVZELFdBQVksaUJBQWlCO1FBQzVCLHlFQUFZLENBQUE7UUFDWiwyRUFBYSxDQUFBO1FBQ2IsdUZBQW1CLENBQUE7UUFDbkIsdUZBQW1CLENBQUE7UUFDbkIseUZBQW9CLENBQUE7UUFDcEIsMkZBQXFCLENBQUE7UUFDckIseUZBQW9CLENBQUE7UUFDcEIseUZBQW9CLENBQUE7UUFDcEIsbUZBQWlCLENBQUE7SUFDbEIsQ0FBQyxFQVZXLGlCQUFpQixHQUFqQix5QkFBaUIsS0FBakIseUJBQWlCLFFBVTVCO0lBZ0NZLFFBQUEscUJBQXFCLEdBQTREO1FBQzdGLGVBQWUsQ0FBQyxrQkFBa0I7UUFDbEM7WUFDQyxNQUFNLEVBQUUsZ0JBQWdCO1lBQ3hCLEtBQUssRUFBRSxlQUFlLENBQUMsMEJBQTBCO1lBQ2pELE9BQU8sRUFBRSxlQUFlLENBQUMsaUNBQWlDO1NBQzFEO1FBQ0Q7WUFDQyxNQUFNLEVBQUUsb0JBQW9CO1lBQzVCLEtBQUssRUFBRSxlQUFlLENBQUMsOEJBQThCO1lBQ3JELE9BQU8sRUFBRSxlQUFlLENBQUMscUNBQXFDO1NBQzlEO1FBQ0Q7WUFDQyxNQUFNLEVBQUUsYUFBYTtZQUNyQixLQUFLLEVBQUUsZUFBZSxDQUFDLHVCQUF1QjtZQUM5QyxPQUFPLEVBQUUsZUFBZSxDQUFDLDhCQUE4QjtTQUN2RDtRQUNELGVBQWUsQ0FBQyxtQkFBbUI7UUFDbkM7WUFDQyxNQUFNLEVBQUUsY0FBYztZQUN0QixLQUFLLEVBQUUsZUFBZSxDQUFDLHdCQUF3QjtZQUMvQyxPQUFPLEVBQUUsZUFBZSxDQUFDLCtCQUErQjtTQUN4RDtRQUNEO1lBQ0MsTUFBTSxFQUFFLGVBQWU7WUFDdkIsS0FBSyxFQUFFLGVBQWUsQ0FBQyx5QkFBeUI7WUFDaEQsT0FBTyxFQUFFLGVBQWUsQ0FBQyxnQ0FBZ0M7U0FDekQ7UUFDRCxlQUFlLENBQUMsNEJBQTRCO1FBQzVDO1lBQ0MsTUFBTSxFQUFFLHdCQUF3QjtZQUNoQyxLQUFLLEVBQUUsZUFBZSxDQUFDLGlDQUFpQztZQUN4RCxPQUFPLEVBQUUsZUFBZSxDQUFDLHdDQUF3QztZQUNqRSxNQUFNLEVBQUU7Z0JBQ1AsR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUc7YUFDcEU7U0FDRDtRQUNEO1lBQ0MsTUFBTSxFQUFFLHlCQUF5QjtZQUNqQyxLQUFLLEVBQUUsZUFBZSxDQUFDLGtDQUFrQztZQUN6RCxPQUFPLEVBQUUsZUFBZSxDQUFDLHlDQUF5QztZQUNsRSxNQUFNLEVBQUU7Z0JBQ1AsR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUc7YUFDckU7U0FDRDtRQUNEO1lBQ0MsTUFBTSxFQUFFLHdCQUF3QjtZQUNoQyxLQUFLLEVBQUUsZUFBZSxDQUFDLGlDQUFpQztZQUN4RCxPQUFPLEVBQUUsZUFBZSxDQUFDLHdDQUF3QztZQUNqRSxNQUFNLEVBQUU7Z0JBQ1AsR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUc7YUFDcEU7U0FDRDtRQUNEO1lBQ0MsTUFBTSxFQUFFLHdCQUF3QjtZQUNoQyxLQUFLLEVBQUUsZUFBZSxDQUFDLGlDQUFpQztZQUN4RCxPQUFPLEVBQUUsZUFBZSxDQUFDLHdDQUF3QztZQUNqRSxNQUFNLEVBQUU7Z0JBQ1AsR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUc7YUFDcEU7U0FDRDtLQUNELENBQUM7SUFrQ1csUUFBQSxRQUFRLEdBQW1DO1FBQ3ZELEtBQUssRUFBRTtZQUNOLFdBQVcsRUFBRSxDQUFDLHlCQUFlLENBQUMsS0FBSyxDQUFDO1lBQ3BDLFlBQVksRUFBRSxNQUFNO1NBQ3BCO1FBQ0QsUUFBUSxFQUFFO1lBQ1QsV0FBVyxFQUFFLENBQUMseUJBQWUsQ0FBQyxXQUFXLENBQUM7WUFDMUMsT0FBTyxFQUFFLHlCQUFlLENBQUMsV0FBVztTQUNwQztRQUNELEtBQUssRUFBRTtZQUNOLFdBQVcsRUFBRTtnQkFDWixvQkFBVSxDQUFDLFdBQVc7Z0JBQ3RCLG9CQUFVLENBQUMsU0FBUztnQkFDcEIsb0JBQVUsQ0FBQyxpQkFBaUI7Z0JBQzVCLG9CQUFVLENBQUMsV0FBVztnQkFDdEIsb0JBQVUsQ0FBQyxnQkFBZ0I7YUFDM0I7WUFDRCxhQUFhLEVBQUUsSUFBSTtZQUNuQixNQUFNLEVBQUUsQ0FBQyxJQUFXLEVBQUUsTUFBYyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0RixLQUFLLEVBQUUsQ0FBQyxJQUFXLEVBQUUsRUFBRTtnQkFDdEIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztZQUNoQyxDQUFDO1NBQ0Q7UUFDRCxPQUFPLEVBQUU7WUFDUixXQUFXLEVBQUUsQ0FBQyx5QkFBZSxDQUFDLFVBQVUsQ0FBQztZQUN6QyxPQUFPLEVBQUUseUJBQWUsQ0FBQyxVQUFVO1NBQ25DO1FBQ0QsaUJBQWlCLEVBQUU7WUFDbEIsV0FBVyxFQUFFLENBQUMsT0FBd0MsRUFBRSxFQUFFO2dCQUN6RCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUs7cUJBQ3JDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUNiLENBQUM7b0JBQ0EsS0FBSyxFQUFFLEtBQUs7b0JBQ1osTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEtBQW1CLENBQUM7aUJBQ3hFLENBQUMsQ0FBQztxQkFDRixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDNUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzVGO2dCQUVELE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQztTQUNEO1FBQ0QsSUFBSSxFQUFFO1lBQ0wsV0FBVyxFQUFFLENBQUMseUJBQWUsQ0FBQyxPQUFPLENBQUM7WUFDdEMsT0FBTyxFQUFFLHlCQUFlLENBQUMsT0FBTztZQUNoQyxZQUFZLEVBQUUsT0FBTztTQUNyQjtRQUNELFVBQVUsRUFBRTtZQUNYLFdBQVcsRUFBRSxDQUFDLHlCQUFlLENBQUMsYUFBYSxDQUFDO1lBQzVDLE9BQU8sRUFBRSx5QkFBZSxDQUFDLGFBQWE7WUFDdEMsYUFBYSxFQUFFLElBQUk7U0FDbkI7UUFDRCxJQUFJLEVBQUU7WUFDTCxXQUFXLEVBQUUsQ0FBQyx5QkFBZSxDQUFDLElBQUksQ0FBQztZQUNuQyxhQUFhLEVBQUUsSUFBSTtTQUNuQjtLQUNELENBQUM7SUF5REYsSUFBWSxpQkE4Qlg7SUE5QkQsV0FBWSxpQkFBaUI7UUFJNUIsbUZBQWlCLENBQUE7UUFLakIsK0ZBQXVCLENBQUE7UUFLdkIsaUZBQWdCLENBQUE7UUFLaEIsbUZBQWlCLENBQUE7UUFLakIsNkZBQXNCLENBQUE7UUFLdEIsbUZBQWlCLENBQUE7SUFDbEIsQ0FBQyxFQTlCVyxpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFpQixRQThCNUI7SUFFWSxRQUFBLGlCQUFpQixHQUFzRDtRQUNuRixLQUFLLEVBQUU7WUFDTixTQUFTLEVBQUUsQ0FBQyxxQkFBYSxDQUFDLEtBQUssQ0FBQztZQUNoQyxjQUFjLEVBQUUsQ0FBQztTQUNqQjtRQUNELEdBQUcsRUFBRTtZQUNKLFNBQVMsRUFBRTtnQkFDVixnQkFBUSxDQUFDLFNBQVM7Z0JBQ2xCLGdCQUFRLENBQUMsZUFBZTtnQkFDeEIsZ0JBQVEsQ0FBQyxPQUFPO2dCQUNoQixnQkFBUSxDQUFDLGFBQWE7Z0JBQ3RCLGdCQUFRLENBQUMsUUFBUTtnQkFDakIsZ0JBQVEsQ0FBQyxjQUFjO2dCQUN2QixnQkFBUSxDQUFDLG9CQUFvQjthQUM3QjtZQUNELEtBQUssRUFBRTtnQkFDTixJQUFJLEVBQUUsaUJBQWlCLENBQUMsdUJBQXVCO2dCQUMvQyxNQUFNLEVBQUUsb0JBQVUsQ0FBQyxJQUFJO2FBQ3ZCO1NBQ0Q7UUFDRCxPQUFPLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1YsZ0JBQVEsQ0FBQyxPQUFPO2dCQUNoQixnQkFBUSxDQUFDLFdBQVc7Z0JBQ3BCLGdCQUFRLENBQUMsZUFBZTtnQkFDeEIsZ0JBQVEsQ0FBQyxlQUFlO2FBQ3hCO1NBQ0Q7UUFDRCxHQUFHLEVBQUU7WUFDSixTQUFTLEVBQUUsQ0FBQyxxQkFBYSxDQUFDLE9BQU8sQ0FBQztZQUNsQyxjQUFjLEVBQUUsQ0FBQztZQUNqQixLQUFLLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLGlCQUFpQixDQUFDLHVCQUF1QjtnQkFDL0MsTUFBTSxFQUFFLG9CQUFVLENBQUMsS0FBSzthQUN4QjtTQUNEO1FBQ0QsUUFBUSxFQUFFO1lBQ1QsU0FBUyxFQUFFLENBQUMscUJBQWEsQ0FBQyxRQUFRLENBQUM7WUFDbkMsY0FBYyxFQUFFLENBQUM7U0FDakI7UUFDRCxPQUFPLEVBQUU7WUFDUixXQUFXLEVBQUUsQ0FBQyxvQkFBVSxDQUFDLE9BQU8sQ0FBQztZQUNqQyxLQUFLLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLGlCQUFpQixDQUFDLHVCQUF1QjtnQkFDL0MsTUFBTSxFQUFFLG9CQUFVLENBQUMsT0FBTzthQUMxQjtTQUNEO1FBQ0QsS0FBSyxFQUFFO1lBQ04sU0FBUyxFQUFFLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUM7WUFDakMsY0FBYyxFQUFFLENBQUM7U0FDakI7UUFDRCxTQUFTLEVBQUU7WUFDVixTQUFTLEVBQUUsa0JBQVMsQ0FBQyxJQUFJO1NBQ3pCO1FBQ0QsU0FBUyxFQUFFO1lBQ1YsU0FBUyxFQUFFLGtCQUFTLENBQUMsSUFBSTtTQUN6QjtRQUNELFVBQVUsRUFBRTtZQUNYLFNBQVMsRUFBRSxrQkFBUyxDQUFDLEtBQUs7U0FDMUI7UUFDRCxTQUFTLEVBQUU7WUFDVixTQUFTLEVBQUUsa0JBQVMsQ0FBQyxJQUFJO1NBQ3pCO1FBQ0QsVUFBVSxFQUFFO1lBQ1gsU0FBUyxFQUFFLGtCQUFTLENBQUMsS0FBSztTQUMxQjtRQUNELFNBQVMsRUFBRTtZQUNWLFNBQVMsRUFBRSxrQkFBUyxDQUFDLElBQUk7U0FDekI7UUFDRCxTQUFTLEVBQUU7WUFDVixTQUFTLEVBQUUsa0JBQVMsQ0FBQyxJQUFJO1NBQ3pCO1FBQ0QsU0FBUyxFQUFFO1lBQ1YsU0FBUyxFQUFFLGtCQUFTLENBQUMsSUFBSTtTQUN6QjtRQUNELFdBQVcsRUFBRTtZQUNaLFNBQVMsRUFBRTtnQkFDVixnQkFBUSxDQUFDLFVBQVU7Z0JBQ25CLGdCQUFRLENBQUMsYUFBYTtnQkFDdEIsZ0JBQVEsQ0FBQyxVQUFVO2dCQUNuQixnQkFBUSxDQUFDLFlBQVk7Z0JBQ3JCLGdCQUFRLENBQUMsaUJBQWlCO2FBQzFCO1lBQ0QsT0FBTyxFQUFFLElBQUk7U0FDYjtRQUNELFVBQVUsRUFBRTtZQUNYLFNBQVMsRUFBRTtnQkFDVixnQkFBUSxDQUFDLFdBQVc7Z0JBQ3BCLGdCQUFRLENBQUMsU0FBUztnQkFDbEIsZ0JBQVEsQ0FBQyxTQUFTO2dCQUNsQixnQkFBUSxDQUFDLFdBQVc7Z0JBQ3BCLGdCQUFRLENBQUMsZ0JBQWdCO2FBQ3pCO1lBQ0QsT0FBTyxFQUFFLElBQUk7U0FDYjtRQUNELFlBQVksRUFBRTtZQUNiLFNBQVMsRUFBRSxDQUFDLHFCQUFhLENBQUMsUUFBUSxDQUFDO1lBQ25DLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxpQkFBaUI7WUFDMUMsYUFBYSxFQUFFLENBQUM7U0FDaEI7UUFDRCxXQUFXLEVBQUU7WUFDWixTQUFTLEVBQUU7Z0JBQ1YsZ0JBQVEsQ0FBQyxRQUFRO2dCQUNqQixnQkFBUSxDQUFDLFVBQVU7Z0JBQ25CLGdCQUFRLENBQUMsU0FBUzthQUNsQjtZQUNELEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxpQkFBaUI7U0FDMUM7UUFDRCxVQUFVLEVBQUU7WUFDWCxTQUFTLEVBQUUsQ0FBQyxxQkFBYSxDQUFDLE1BQU0sQ0FBQztZQUNqQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsaUJBQWlCO1NBQzFDO1FBQ0QsSUFBSSxFQUFFO1lBQ0wsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsb0JBQWEsQ0FBQyxhQUFhLENBQUM7WUFDeEQsS0FBSyxFQUFFLGlCQUFpQixDQUFDLGlCQUFpQjtZQUMxQyxhQUFhLEVBQUUsQ0FBQztTQUNoQjtRQUNELE9BQU8sRUFBRTtZQUNSLFNBQVMsRUFBRSxDQUFDLHFCQUFhLENBQUMsT0FBTyxDQUFDO1lBQ2xDLGNBQWMsRUFBRSxDQUFDO1NBQ2pCO1FBQ0QsTUFBTSxFQUFFO1lBQ1AsU0FBUyxFQUFFLENBQUMscUJBQWEsQ0FBQyxNQUFNLENBQUM7WUFDakMsS0FBSyxFQUFFO2dCQUNOLElBQUksRUFBRSxpQkFBaUIsQ0FBQyx1QkFBdUI7Z0JBQy9DLE1BQU0sRUFBRSxvQkFBVSxDQUFDLE1BQU07YUFDekI7U0FDRDtRQUNELElBQUksRUFBRTtZQUNMLFdBQVcsRUFBRSxDQUFDLG9CQUFVLENBQUMsSUFBSSxDQUFDO1NBQzlCO1FBQ0QsR0FBRyxFQUFFO1lBQ0osV0FBVyxFQUFFLENBQUMsb0JBQVUsQ0FBQyxJQUFJLENBQUM7WUFDOUIsS0FBSyxFQUFFO2dCQUNOLElBQUksRUFBRSxpQkFBaUIsQ0FBQyx1QkFBdUI7Z0JBQy9DLE1BQU0sRUFBRSxvQkFBVSxDQUFDLElBQUk7YUFDdkI7U0FDRDtRQUNELGlCQUFpQixFQUFFO1lBQ2xCLFNBQVMsRUFBRTtnQkFDVixnQkFBUSxDQUFDLFdBQVc7Z0JBQ3BCLGdCQUFRLENBQUMsU0FBUztnQkFDbEIsZ0JBQVEsQ0FBQyxpQkFBaUI7Z0JBQzFCLGdCQUFRLENBQUMsV0FBVztnQkFDcEIsZ0JBQVEsQ0FBQyxnQkFBZ0I7YUFDekI7WUFDRCxjQUFjLEVBQUUsQ0FBQztTQUNqQjtRQUNELElBQUksRUFBRTtZQUNMLFNBQVMsRUFBRSxDQUFDLHFCQUFhLENBQUMsSUFBSSxDQUFDO1lBQy9CLGNBQWMsRUFBRSxDQUFDO1NBQ2pCO1FBQ0QsS0FBSyxFQUFFO1lBQ04sU0FBUyxFQUFFO2dCQUNWLGdCQUFRLENBQUMsYUFBYTtnQkFDdEIsZ0JBQVEsQ0FBQyxVQUFVO2FBQ25CO1lBQ0QsS0FBSyxFQUFFO2dCQUNOLElBQUksRUFBRSxpQkFBaUIsQ0FBQyx1QkFBdUI7Z0JBQy9DLE1BQU0sRUFBRSxvQkFBVSxDQUFDLE9BQU87YUFDMUI7U0FDRDtRQUNELEtBQUssRUFBRTtZQUNOLFNBQVMsRUFBRSxDQUFDLHFCQUFhLENBQUMsS0FBSyxDQUFDO1lBQ2hDLEtBQUssRUFBRTtnQkFDTixJQUFJLEVBQUUsaUJBQWlCLENBQUMsZ0JBQWdCO2dCQUN4QyxNQUFNLEVBQUUscUJBQWEsQ0FBQyxLQUFLO2FBQzNCO1NBQ0Q7UUFDRCxPQUFPLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1YsZ0JBQVEsQ0FBQyxhQUFhO2dCQUN0QixnQkFBUSxDQUFDLFdBQVc7Z0JBQ3BCLGdCQUFRLENBQUMsWUFBWTtnQkFDckIsZ0JBQVEsQ0FBQyxrQkFBa0I7YUFDM0I7WUFDRCxLQUFLLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLGlCQUFpQixDQUFDLHVCQUF1QjtnQkFDL0MsTUFBTSxFQUFFLG9CQUFVLENBQUMsSUFBSTthQUN2QjtTQUNEO1FBQ0QsUUFBUSxFQUFFO1lBQ1QsU0FBUyxFQUFFLENBQUMsZ0JBQVEsQ0FBQyxRQUFRLENBQUM7WUFDOUIsYUFBYSxFQUFFLElBQUk7WUFDbkIsWUFBWSxFQUFFLElBQUk7U0FDbEI7UUFDRCxNQUFNLEVBQUU7WUFDUCxXQUFXLEVBQUUsQ0FBQyxvQkFBVSxDQUFDLEdBQUcsQ0FBQztZQUM3QixLQUFLLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLGlCQUFpQixDQUFDLHVCQUF1QjtnQkFDL0MsTUFBTSxFQUFFLG9CQUFVLENBQUMsR0FBRzthQUN0QjtTQUNEO1FBQ0QsY0FBYyxFQUFFO1lBQ2YsV0FBVyxFQUFFLENBQUMsb0JBQVUsQ0FBQyxZQUFZLENBQUM7WUFDdEMsU0FBUyxFQUFFO2dCQUNWLHFCQUFhLENBQUMsMkJBQTJCO2dCQUN6QyxxQkFBYSxDQUFDLHlCQUF5QjtnQkFDdkMscUJBQWEsQ0FBQyw2QkFBNkI7Z0JBQzNDLHFCQUFhLENBQUMsbUJBQW1CO2dCQUNqQyxxQkFBYSxDQUFDLCtCQUErQjthQUM3QztZQUNELGFBQWEsRUFBRSxDQUFDO1NBQ2hCO1FBQ0QsVUFBVSxFQUFFO1lBQ1gsU0FBUyxFQUFFLENBQUMscUJBQWEsQ0FBQyxVQUFVLENBQUM7WUFDckMsY0FBYyxFQUFFLENBQUM7U0FDakI7UUFDRCxJQUFJLEVBQUU7WUFDTCxTQUFTLEVBQUU7Z0JBQ1YsZ0JBQVEsQ0FBQyxRQUFRO2dCQUNqQixnQkFBUSxDQUFDLGFBQWE7Z0JBQ3RCLGdCQUFRLENBQUMsU0FBUzthQUNsQjtZQUNELGNBQWMsRUFBRSxDQUFDO1NBQ2pCO0tBQ0QsQ0FBQztJQTZDRixJQUFZLFFBT1g7SUFQRCxXQUFZLFFBQVE7UUFDbkIsMkNBQU0sQ0FBQTtRQUNOLCtDQUFRLENBQUE7UUFDUiwyQ0FBTSxDQUFBO1FBQ04sK0NBQVEsQ0FBQTtRQUNSLG1EQUFVLENBQUE7UUFDVix5Q0FBSyxDQUFBO0lBQ04sQ0FBQyxFQVBXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBT25CO0lBRUQsSUFBWSxXQUdYO0lBSEQsV0FBWSxXQUFXO1FBQ3RCLDZDQUFJLENBQUE7UUFDSiw2Q0FBSSxDQUFBO0lBQ0wsQ0FBQyxFQUhXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBR3RCO0lBRUQsSUFBSSxJQUFzQixDQUFDO0lBRTNCLFNBQWdCLGVBQWU7UUFDOUIsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztTQUN6QztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQU5ELDBDQU1DO0lBRUQsU0FBZ0IsZUFBZSxDQUFDLFFBQTBCO1FBQ3pELElBQUksR0FBRyxRQUFRLENBQUM7SUFDakIsQ0FBQztJQUZELDBDQUVDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsV0FBbUQ7UUFDckYsT0FBTyxlQUFlLEVBQUUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUZELGdEQUVDO0lBRUQsU0FBZ0IsZUFBZSxDQUE0QixHQUFNO1FBQ2hFLE9BQU8sZUFBZSxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFGRCwwQ0FFQyJ9