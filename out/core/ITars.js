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
define(["require", "exports", "@wayward/game/game/doodad/IDoodad", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/entity/IEntity", "@wayward/game/game/entity/IHuman", "@wayward/game/game/item/IItem"], function (require, exports, IDoodad_1, IAction_1, IEntity_1, IHuman_1, IItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReserveType = exports.TarsMode = exports.inventoryBuildItems = exports.inventoryItemInfo = exports.InventoryItemFlag = exports.baseInfo = exports.chestTypes = exports.QuantumBurstStatus = exports.NavigationSystemState = exports.tarsUniqueNpcType = exports.defaultMaxTilesChecked = exports.tickSpeed = void 0;
    exports.tickSpeed = 333;
    exports.defaultMaxTilesChecked = 3000;
    exports.tarsUniqueNpcType = "TARS";
    var NavigationSystemState;
    (function (NavigationSystemState) {
        NavigationSystemState[NavigationSystemState["NotInitialized"] = 0] = "NotInitialized";
        NavigationSystemState[NavigationSystemState["Initializing"] = 1] = "Initializing";
        NavigationSystemState[NavigationSystemState["Initialized"] = 2] = "Initialized";
    })(NavigationSystemState || (exports.NavigationSystemState = NavigationSystemState = {}));
    var QuantumBurstStatus;
    (function (QuantumBurstStatus) {
        QuantumBurstStatus[QuantumBurstStatus["Start"] = 0] = "Start";
        QuantumBurstStatus[QuantumBurstStatus["CooldownStart"] = 1] = "CooldownStart";
        QuantumBurstStatus[QuantumBurstStatus["CooldownEnd"] = 2] = "CooldownEnd";
    })(QuantumBurstStatus || (exports.QuantumBurstStatus = QuantumBurstStatus = {}));
    exports.chestTypes = new Map([
        [IItem_1.ItemType.CopperChest, IDoodad_1.DoodadType.CopperChest],
        [IItem_1.ItemType.IronChest, IDoodad_1.DoodadType.IronChest],
        [IItem_1.ItemType.OrnateWoodenChest, IDoodad_1.DoodadType.OrnateWoodenChest],
        [IItem_1.ItemType.WoodenChest, IDoodad_1.DoodadType.WoodenChest],
        [IItem_1.ItemType.WroughtIronChest, IDoodad_1.DoodadType.WroughtIronChest],
    ]);
    exports.baseInfo = {
        altar: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.Altar],
            allowMultiple: true,
        },
        anvil: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.Anvil],
            tryPlaceNear: "kiln",
        },
        campfire: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.LitCampfire],
            litType: IDoodad_1.DoodadTypeGroup.LitCampfire,
            allowMultiple: true,
        },
        chest: {
            doodadTypes: Array.from(exports.chestTypes.values()),
            allowMultiple: true,
            canAdd: (context, target) => {
                if (context.base.intermediateChest.includes(target)) {
                    return false;
                }
                if (context.options.goodCitizen && multiplayer.isConnected && target.getBuilder() !== context.human) {
                    return false;
                }
                if (context.utilities.base.isTreasureChestLocation(context, target.tile)) {
                    return false;
                }
                return true;
            },
            onAdd: (context) => {
                context.base.buildAnotherChest = false;
            },
        },
        dripStone: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.Dripstone],
            allowMultiple: true,
        },
        furnace: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.LitFurnace],
            litType: IDoodad_1.DoodadTypeGroup.LitFurnace,
            allowMultiple: true,
        },
        intermediateChest: {
            doodadTypes: Array.from(exports.chestTypes.values()),
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
        sailboat: {
            doodadTypes: [IDoodad_1.DoodadType.Sailboat],
            nearBaseDistanceSq: Infinity,
            allowMultiple: true,
        },
        solarStill: {
            doodadTypes: [IDoodad_1.DoodadType.SolarStill],
            allowMultiple: true,
            requireShallowWater: true,
            nearBaseDistanceSq: Math.pow(28, 2),
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
    })(InventoryItemFlag || (exports.InventoryItemFlag = InventoryItemFlag = {}));
    exports.inventoryItemInfo = {
        altar: {
            itemTypes: [IItem_1.ItemTypeGroup.Altar],
            requiredMinDur: 1,
        },
        anvil: {
            itemTypes: [IItem_1.ItemTypeGroup.Anvil],
            requiredMinDur: 1,
        },
        axe: {
            itemTypes: [
                IItem_1.ItemType.BasaltAxe,
                IItem_1.ItemType.CopperAxe,
                IItem_1.ItemType.CopperDoubleAxe,
                IItem_1.ItemType.GraniteAxe,
                IItem_1.ItemType.IronAxe,
                IItem_1.ItemType.IronDoubleAxe,
                IItem_1.ItemType.SandstoneAxe,
                IItem_1.ItemType.WroughtIronAxe,
                IItem_1.ItemType.WroughtIronDoubleAxe,
            ],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Chop,
            },
        },
        backpack: {
            itemTypes: [
                IItem_1.ItemType.Backpack,
            ],
            allowMultiple: 2,
        },
        bandage: {
            itemTypes: [
                IItem_1.ItemType.AloeVeraBandage,
                IItem_1.ItemType.Bandage,
                IItem_1.ItemType.CharcoalBandage,
                IItem_1.ItemType.PeatBandage,
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
        butcher: {
            actionTypes: [IAction_1.ActionType.Butcher],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Butcher,
            },
        },
        campfire: {
            itemTypes: [IItem_1.ItemTypeGroup.Campfire],
            requiredMinDur: 1,
        },
        curePoison: {
            actionTypes: [IAction_1.ActionType.Cure],
            cureStatus: IEntity_1.StatusType.Poisoned,
        },
        chest: {
            itemTypes: Array.from(exports.chestTypes.keys()),
            requiredMinDur: 1,
        },
        dripStone: {
            itemTypes: [IItem_1.ItemTypeGroup.Dripstone],
            requiredMinDur: 1,
        },
        equipBack: {
            equipType: IHuman_1.EquipType.Back,
        },
        equipWaist: {
            equipType: IHuman_1.EquipType.Waist,
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
        },
        equipSword: {
            itemTypes: [
                IItem_1.ItemType.CopperShortSword,
                IItem_1.ItemType.GoldShortSword,
                IItem_1.ItemType.IronShortSword,
                IItem_1.ItemType.WoodenShortSword,
                IItem_1.ItemType.WroughtIronShortSword,
            ],
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
        fishing: {
            itemTypes: [
                IItem_1.ItemType.FishingNet,
            ],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Cast,
            },
        },
        food: {
            itemTypes: (context) => Array.from(context.utilities.item.foodItemTypes),
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
            itemTypes: Array.from(exports.chestTypes.keys()),
            requiredMinDur: 1,
        },
        kiln: {
            itemTypes: [IItem_1.ItemTypeGroup.Kiln],
            requiredMinDur: 1,
        },
        knife: {
            itemTypes: [
                IItem_1.ItemType.BasaltKnife,
                IItem_1.ItemType.CopperKnife,
                IItem_1.ItemType.GraniteKnife,
                IItem_1.ItemType.IronKnife,
                IItem_1.ItemType.ObsidianKnife,
                IItem_1.ItemType.SandstoneKnife,
                IItem_1.ItemType.WroughtIronKnife,
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
        lockPick: {
            actionTypes: [IAction_1.ActionType.Lockpick],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Lockpick,
            },
        },
        pickAxe: {
            itemTypes: [
                IItem_1.ItemType.BasaltPickaxe,
                IItem_1.ItemType.CopperPickaxe,
                IItem_1.ItemType.GranitePickaxe,
                IItem_1.ItemType.IronPickaxe,
                IItem_1.ItemType.WroughtIronPickaxe,
            ],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Mine,
            },
        },
        sailboat: {
            itemTypes: [IItem_1.ItemType.Sailboat],
        },
        shovel: {
            actionTypes: [IAction_1.ActionType.Dig],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Dig,
            },
        },
        solarStill: {
            itemTypes: [IItem_1.ItemType.SolarStill],
            requiredMinDur: 1,
        },
        waterContainer: {
            actionTypes: [IAction_1.ActionType.GatherLiquid],
            itemTypes: [
                IItem_1.ItemTypeGroup.ContainerOfDesalinatedWater,
                IItem_1.ItemTypeGroup.ContainerOfFilteredWater,
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
                IItem_1.ItemType.BasaltWell,
                IItem_1.ItemType.ClayWell,
                IItem_1.ItemType.GraniteWell,
                IItem_1.ItemType.SandstoneWell,
            ],
            requiredMinDur: 1,
        },
    };
    exports.inventoryBuildItems = [
        "campfire",
        "dripStone",
        "waterStill",
        "chest",
        "kiln",
        "well",
        "furnace",
        "anvil",
        "solarStill",
        "sailboat",
        "altar",
    ];
    var TarsMode;
    (function (TarsMode) {
        TarsMode[TarsMode["Manual"] = 0] = "Manual";
        TarsMode[TarsMode["Survival"] = 1] = "Survival";
        TarsMode[TarsMode["TidyUp"] = 2] = "TidyUp";
        TarsMode[TarsMode["Gardener"] = 3] = "Gardener";
        TarsMode[TarsMode["Harvester"] = 4] = "Harvester";
        TarsMode[TarsMode["Terminator"] = 5] = "Terminator";
        TarsMode[TarsMode["TreasureHunter"] = 6] = "TreasureHunter";
        TarsMode[TarsMode["Quest"] = 7] = "Quest";
        TarsMode[TarsMode["Angler"] = 8] = "Angler";
    })(TarsMode || (exports.TarsMode = TarsMode = {}));
    var ReserveType;
    (function (ReserveType) {
        ReserveType[ReserveType["Soft"] = 0] = "Soft";
        ReserveType[ReserveType["Hard"] = 1] = "Hard";
    })(ReserveType || (exports.ReserveType = ReserveType = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9JVGFycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBa0NVLFFBQUEsU0FBUyxHQUFHLEdBQUcsQ0FBQztJQUVoQixRQUFBLHNCQUFzQixHQUFHLElBQUksQ0FBQztJQUU5QixRQUFBLGlCQUFpQixHQUFHLE1BQU0sQ0FBQztJQTJCeEMsSUFBWSxxQkFJWDtJQUpELFdBQVkscUJBQXFCO1FBQ2hDLHFGQUFjLENBQUE7UUFDZCxpRkFBWSxDQUFBO1FBQ1osK0VBQVcsQ0FBQTtJQUNaLENBQUMsRUFKVyxxQkFBcUIscUNBQXJCLHFCQUFxQixRQUloQztJQUVELElBQVksa0JBSVg7SUFKRCxXQUFZLGtCQUFrQjtRQUM3Qiw2REFBSyxDQUFBO1FBQ0wsNkVBQWEsQ0FBQTtRQUNiLHlFQUFXLENBQUE7SUFDWixDQUFDLEVBSlcsa0JBQWtCLGtDQUFsQixrQkFBa0IsUUFJN0I7SUFtQlksUUFBQSxVQUFVLEdBQThCLElBQUksR0FBRyxDQUFDO1FBQzVELENBQUMsZ0JBQVEsQ0FBQyxXQUFXLEVBQUUsb0JBQVUsQ0FBQyxXQUFXLENBQUM7UUFDOUMsQ0FBQyxnQkFBUSxDQUFDLFNBQVMsRUFBRSxvQkFBVSxDQUFDLFNBQVMsQ0FBQztRQUMxQyxDQUFDLGdCQUFRLENBQUMsaUJBQWlCLEVBQUUsb0JBQVUsQ0FBQyxpQkFBaUIsQ0FBQztRQUMxRCxDQUFDLGdCQUFRLENBQUMsV0FBVyxFQUFFLG9CQUFVLENBQUMsV0FBVyxDQUFDO1FBQzlDLENBQUMsZ0JBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxvQkFBVSxDQUFDLGdCQUFnQixDQUFDO0tBQ3hELENBQUMsQ0FBQztJQW1DVSxRQUFBLFFBQVEsR0FBbUM7UUFDdkQsS0FBSyxFQUFFO1lBQ04sV0FBVyxFQUFFLENBQUMseUJBQWUsQ0FBQyxLQUFLLENBQUM7WUFDcEMsYUFBYSxFQUFFLElB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