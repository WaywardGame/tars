define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IHuman", "game/item/IItem"], function (require, exports, IDoodad_1, IAction_1, IHuman_1, IItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReserveType = exports.TarsMode = exports.inventoryItemInfo = exports.InventoryItemFlag = exports.baseInfo = exports.QuantumBurstStatus = exports.NavigationSystemState = exports.defaultMaxTilesChecked = exports.tickSpeed = void 0;
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
            canAdd: (context, target) => {
                if (context.base.intermediateChest.includes(target)) {
                    return false;
                }
                if (context.options.goodCitizen && multiplayer.isConnected() && target.getOwner() !== context.player) {
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9JVGFycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBMkJhLFFBQUEsU0FBUyxHQUFHLEdBQUcsQ0FBQztJQUVoQixRQUFBLHNCQUFzQixHQUFHLElBQUksQ0FBQztJQWlEM0MsSUFBWSxxQkFJWDtJQUpELFdBQVkscUJBQXFCO1FBQzdCLHFGQUFjLENBQUE7UUFDZCxpRkFBWSxDQUFBO1FBQ1osK0VBQVcsQ0FBQTtJQUNmLENBQUMsRUFKVyxxQkFBcUIsR0FBckIsNkJBQXFCLEtBQXJCLDZCQUFxQixRQUloQztJQUVELElBQVksa0JBSVg7SUFKRCxXQUFZLGtCQUFrQjtRQUMxQiw2REFBSyxDQUFBO1FBQ0wsNkVBQWEsQ0FBQTtRQUNiLHlFQUFXLENBQUE7SUFDZixDQUFDLEVBSlcsa0JBQWtCLEdBQWxCLDBCQUFrQixLQUFsQiwwQkFBa0IsUUFJN0I7SUEyQ1ksUUFBQSxRQUFRLEdBQW1DO1FBQ3BELEtBQUssRUFBRTtZQUNILFdBQVcsRUFBRSxDQUFDLHlCQUFlLENBQUMsS0FBSyxDQUFDO1lBQ3BDLFlBQVksRUFBRSxNQUFNO1NBQ3ZCO1FBQ0QsUUFBUSxFQUFFO1lBQ04sV0FBVyxFQUFFLENBQUMseUJBQWUsQ0FBQyxXQUFXLENBQUM7WUFDMUMsT0FBTyxFQUFFLHlCQUFlLENBQUMsV0FBVztTQUN2QztRQUNELEtBQUssRUFBRTtZQUNILFdBQVcsRUFBRTtnQkFDVCxvQkFBVSxDQUFDLFdBQVc7Z0JBQ3RCLG9CQUFVLENBQUMsU0FBUztnQkFDcEIsb0JBQVUsQ0FBQyxpQkFBaUI7Z0JBQzVCLG9CQUFVLENBQUMsV0FBVztnQkFDdEIsb0JBQVUsQ0FBQyxnQkFBZ0I7YUFDOUI7WUFDRCxhQUFhLEVBQUUsSUFBSTtZQUNuQixNQUFNLEVBQUUsQ0FBQyxPQUFnQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUN6QyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENB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