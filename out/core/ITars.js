define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IEntity", "game/entity/IHuman", "game/item/IItem"], function (require, exports, IDoodad_1, IAction_1, IEntity_1, IHuman_1, IItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReserveType = exports.TarsMode = exports.inventoryBuildItems = exports.inventoryItemInfo = exports.InventoryItemFlag = exports.baseInfo = exports.chestTypes = exports.QuantumBurstStatus = exports.NavigationSystemState = exports.defaultMaxTilesChecked = exports.tickSpeed = void 0;
    exports.tickSpeed = 333;
    exports.defaultMaxTilesChecked = 3000;
    var NavigationSystemState;
    (function (NavigationSystemState) {
        NavigationSystemState[NavigationSystemState["NotInitialized"] = 0] = "NotInitialized";
        NavigationSystemState[NavigationSystemState["Initializing"] = 1] = "Initializing";
        NavigationSystemState[NavigationSystemState["Initialized"] = 2] = "Initialized";
    })(NavigationSystemState = exports.NavigationSystemState || (exports.NavigationSystemState = {}));
    var QuantumBurstStatus;
    (function (QuantumBurstStatus) {
        QuantumBurstStatus[QuantumBurstStatus["Start"] = 0] = "Start";
        QuantumBurstStatus[QuantumBurstStatus["CooldownStart"] = 1] = "CooldownStart";
        QuantumBurstStatus[QuantumBurstStatus["CooldownEnd"] = 2] = "CooldownEnd";
    })(QuantumBurstStatus = exports.QuantumBurstStatus || (exports.QuantumBurstStatus = {}));
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
                return true;
            },
            onAdd: (context) => {
                context.base.buildAnotherChest = false;
            },
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
    })(InventoryItemFlag = exports.InventoryItemFlag || (exports.InventoryItemFlag = {}));
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
        campfire: {
            itemTypes: [IItem_1.ItemTypeGroup.Campfire],
            requiredMinDur: 1,
        },
        curePoison: {
            actionTypes: [IAction_1.ActionType.Cure],
            cureStatus: IEntity_1.StatusType.Poisoned,
        },
        butcher: {
            actionTypes: [IAction_1.ActionType.Butcher],
            flags: {
                flag: InventoryItemFlag.PreferHigherActionBonus,
                option: IAction_1.ActionType.Butcher,
            },
        },
        chest: {
            itemTypes: Array.from(exports.chestTypes.keys()),
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
        fishingRod: {
            actionTypes: [IAction_1.ActionType.Cast],
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
        "waterStill",
        "chest",
        "kiln",
        "well",
        "furnace",
        "anvil",
        "solarStill",
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
    })(TarsMode = exports.TarsMode || (exports.TarsMode = {}));
    var ReserveType;
    (function (ReserveType) {
        ReserveType[ReserveType["Soft"] = 0] = "Soft";
        ReserveType[ReserveType["Hard"] = 1] = "Hard";
    })(ReserveType = exports.ReserveType || (exports.ReserveType = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9JVGFycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBOEJhLFFBQUEsU0FBUyxHQUFHLEdBQUcsQ0FBQztJQUVoQixRQUFBLHNCQUFzQixHQUFHLElBQUksQ0FBQztJQTJCM0MsSUFBWSxxQkFJWDtJQUpELFdBQVkscUJBQXFCO1FBQzdCLHFGQUFjLENBQUE7UUFDZCxpRkFBWSxDQUFBO1FBQ1osK0VBQVcsQ0FBQTtJQUNmLENBQUMsRUFKVyxxQkFBcUIsR0FBckIsNkJBQXFCLEtBQXJCLDZCQUFxQixRQUloQztJQUVELElBQVksa0JBSVg7SUFKRCxXQUFZLGtCQUFrQjtRQUMxQiw2REFBSyxDQUFBO1FBQ0wsNkVBQWEsQ0FBQTtRQUNiLHlFQUFXLENBQUE7SUFDZixDQUFDLEVBSlcsa0JBQWtCLEdBQWxCLDBCQUFrQixLQUFsQiwwQkFBa0IsUUFJN0I7SUFtQlksUUFBQSxVQUFVLEdBQThCLElBQUksR0FBRyxDQUFDO1FBQ3pELENBQUMsZ0JBQVEsQ0FBQyxXQUFXLEVBQUUsb0JBQVUsQ0FBQyxXQUFXLENBQUM7UUFDOUMsQ0FBQyxnQkFBUSxDQUFDLFNBQVMsRUFBRSxvQkFBVSxDQUFDLFNBQVMsQ0FBQztRQUMxQyxDQUFDLGdCQUFRLENBQUMsaUJBQWlCLEVBQUUsb0JBQVUsQ0FBQyxpQkFBaUIsQ0FBQztRQUMxRCxDQUFDLGdCQUFRLENBQUMsV0FBVyxFQUFFLG9CQUFVLENBQUMsV0FBVyxDQUFDO1FBQzlDLENBQUMsZ0JBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxvQkFBVSxDQUFDLGdCQUFnQixDQUFDO0tBQzNELENBQUMsQ0FBQztJQWdDVSxRQUFBLFFBQVEsR0FBbUM7UUFDcEQsS0FBSyxFQUFFO1lBQ0gsV0FBVyxFQUFFLENBQUMseUJBQWUsQ0FBQyxLQUFLLENBQUM7WUFDcEMsWUFBWSxFQUFFLE1BQU07U0FDdkI7UUFDRCxRQUFRLEVBQUU7WUFD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