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
define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IEntity", "game/entity/IHuman", "game/item/IItem"], function (require, exports, IDoodad_1, IAction_1, IEntity_1, IHuman_1, IItem_1) {
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
        anvil: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.Anvil],
            tryPlaceNear: "kiln",
        },
        campfire: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.LitCampfire],
            litType: IDoodad_1.DoodadTypeGroup.LitCampfire,
        },
        chest: {
            doodadTypes: Array.from(exports.chestTypes.values()),
            allowMultiple: true,
            canAdd: (context, target) => {
                if (context.base.intermediateChest.includes(target)) {
                    return false;
                }
                if (context.options.goodCitizen && multiplayer.isConnected() && target.getBuilder() !== context.human) {
                    return false;
                }
                if (context.utilities.base.isTreasureChestLocation(context, target)) {
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
        },
        furnace: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.LitFurnace],
            litType: IDoodad_1.DoodadTypeGroup.LitFurnace,
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
                IItem_1.ItemType.CopperSword,
                IItem_1.ItemType.GoldSword,
                IItem_1.ItemType.IronSword,
                IItem_1.ItemType.WoodenSword,
                IItem_1.ItemType.WroughtIronSword,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9JVGFycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBa0NVLFFBQUEsU0FBUyxHQUFHLEdBQUcsQ0FBQztJQUVoQixRQUFBLHNCQUFzQixHQUFHLElBQUksQ0FBQztJQUU5QixRQUFBLGlCQUFpQixHQUFHLE1BQU0sQ0FBQztJQTJCeEMsSUFBWSxxQkFJWDtJQUpELFdBQVkscUJBQXFCO1FBQzdCLHFGQUFjLENBQUE7UUFDZCxpRkFBWSxDQUFBO1FBQ1osK0VBQVcsQ0FBQTtJQUNmLENBQUMsRUFKVyxxQkFBcUIscUNBQXJCLHFCQUFxQixRQUloQztJQUVELElBQVksa0JBSVg7SUFKRCxXQUFZLGtCQUFrQjtRQUMxQiw2REFBSyxDQUFBO1FBQ0wsNkVBQWEsQ0FBQTtRQUNiLHlFQUFXLENBQUE7SUFDZixDQUFDLEVBSlcsa0JBQWtCLGtDQUFsQixrQkFBa0IsUUFJN0I7SUFtQlksUUFBQSxVQUFVLEdBQThCLElBQUksR0FBRyxDQUFDO1FBQ3pELENBQUMsZ0JBQVEsQ0FBQyxXQUFXLEVBQUUsb0JBQVUsQ0FBQyxXQUFXLENBQUM7UUFDOUMsQ0FBQyxnQkFBUSxDQUFDLFNBQVMsRUFBRSxvQkFBVSxDQUFDLFNBQVMsQ0FBQztRQUMxQyxDQUFDLGdCQUFRLENBQUMsaUJBQWlCLEVBQUUsb0JBQVUsQ0FBQyxpQkFBaUIsQ0FBQztRQUMxRCxDQUFDLGdCQUFRLENBQUMsV0FBVyxFQUFFLG9CQUFVLENBQUMsV0FBVyxDQUFDO1FBQzlDLENBQUMsZ0JBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxvQkFBVSxDQUFDLGdCQUFnQixDQUFDO0tBQzNELENBQUMsQ0FBQztJQWtDVSxRQUFBLFFBQVEsR0FBbUM7UUFDcEQsS0FBSyxFQUFFO1lBQ0gsV0FBVyxFQUFFLENBQUMseUJBQWUsQ0FBQyxLQUFLLENBQUM7WUFDcEMsWUFBWSxFQUFFLE1B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