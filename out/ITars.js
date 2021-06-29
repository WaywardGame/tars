define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IHuman", "game/item/IItem", "./utilities/Item"], function (require, exports, IDoodad_1, IAction_1, IHuman_1, IItem_1, Item_1) {
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
        TarsTranslation[TarsTranslation["DialogButtonStayHealthy"] = 12] = "DialogButtonStayHealthy";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthyTooltip"] = 13] = "DialogButtonStayHealthyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluence"] = 14] = "DialogButtonUseOrbsOfInfluence";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluenceTooltip"] = 15] = "DialogButtonUseOrbsOfInfluenceTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDeveloperMode"] = 16] = "DialogButtonDeveloperMode";
        TarsTranslation[TarsTranslation["DialogButtonDeveloperModeTooltip"] = 17] = "DialogButtonDeveloperModeTooltip";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurst"] = 18] = "DialogButtonQuantumBurst";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurstTooltip"] = 19] = "DialogButtonQuantumBurstTooltip";
        TarsTranslation[TarsTranslation["DialogLabelItem"] = 20] = "DialogLabelItem";
        TarsTranslation[TarsTranslation["DialogLabelDoodad"] = 21] = "DialogLabelDoodad";
        TarsTranslation[TarsTranslation["DialogModeSurvival"] = 22] = "DialogModeSurvival";
        TarsTranslation[TarsTranslation["DialogModeSurvivalTooltip"] = 23] = "DialogModeSurvivalTooltip";
        TarsTranslation[TarsTranslation["DialogModeTidyUp"] = 24] = "DialogModeTidyUp";
        TarsTranslation[TarsTranslation["DialogModeTidyUpTooltip"] = 25] = "DialogModeTidyUpTooltip";
        TarsTranslation[TarsTranslation["DialogModeGardener"] = 26] = "DialogModeGardener";
        TarsTranslation[TarsTranslation["DialogModeGardenerTooltip"] = 27] = "DialogModeGardenerTooltip";
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
            option: "quantumBurst",
            title: TarsTranslation.DialogButtonQuantumBurst,
            tooltip: TarsTranslation.DialogButtonQuantumBurstTooltip,
        },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQWdCYSxRQUFBLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFFakIsUUFBQSxzQkFBc0IsR0FBRyxJQUFJLENBQUM7SUFFM0MsSUFBWSxlQWtDWDtJQWxDRCxXQUFZLGVBQWU7UUFDMUIsMkVBQWUsQ0FBQTtRQUVmLGlIQUFrQyxDQUFBO1FBRWxDLGlGQUFrQixDQUFBO1FBQ2xCLDZFQUFnQixDQUFBO1FBQ2hCLGlGQUFrQixDQUFBO1FBRWxCLGlGQUFrQixDQUFBO1FBQ2xCLHlGQUFzQixDQUFBO1FBQ3RCLHVHQUE2QixDQUFBO1FBQzdCLDJGQUF1QixDQUFBO1FBQ3ZCLHlHQUE4QixDQUFBO1FBQzlCLGtHQUEwQixDQUFBO1FBQzFCLGdIQUFpQyxDQUFBO1FBQ2pDLDRGQUF1QixDQUFBO1FBQ3ZCLDBHQUE4QixDQUFBO1FBQzlCLDBHQUE4QixDQUFBO1FBQzlCLHdIQUFxQyxDQUFBO1FBQ3JDLGdHQUF5QixDQUFBO1FBQ3pCLDhHQUFnQyxDQUFBO1FBQ2hDLDhGQUF3QixDQUFBO1FBQ3hCLDRHQUErQixDQUFBO1FBRS9CLDRFQUFlLENBQUE7UUFDZixnRkFBaUIsQ0FBQTtRQUVqQixrRkFBa0IsQ0FBQTtRQUNsQixnR0FBeUIsQ0FBQTtRQUN6Qiw4RUFBZ0IsQ0FBQTtRQUNoQiw0RkFBdUIsQ0FBQTtRQUN2QixrRkFBa0IsQ0FBQTtRQUNsQixnR0FBeUIsQ0FBQTtJQUMxQixDQUFDLEVBbENXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBa0MxQjtJQVNELElBQVksaUJBS1g7SUFMRCxXQUFZLGlCQUFpQjtRQUM1Qix5RUFBWSxDQUFBO1FBQ1osMkVBQWEsQ0FBQTtRQUNiLHVGQUFtQixDQUFBO1FBQ25CLHVGQUFtQixDQUFBO0lBQ3BCLENBQUMsRUFMVyxpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFp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