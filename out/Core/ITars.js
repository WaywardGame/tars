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
            canAdd: (base, target) => !base.intermediateChest.includes(target),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9JVGFycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBeUJhLFFBQUEsU0FBUyxHQUFHLEdBQUcsQ0FBQztJQUVoQixRQUFBLHNCQUFzQixHQUFHLElBQUksQ0FBQztJQStDM0MsSUFBWSxxQkFJWDtJQUpELFdBQVkscUJBQXFCO1FBQzdCLHFGQUFjLENBQUE7UUFDZCxpRkFBWSxDQUFBO1FBQ1osK0VBQVcsQ0FBQTtJQUNmLENBQUMsRUFKVyxxQkFBcUIsR0FBckIsNkJBQXFCLEtBQXJCLDZCQUFxQixRQUloQztJQUVELElBQVksa0JBSVg7SUFKRCxXQUFZLGtCQUFrQjtRQUMxQiw2REFBSyxDQUFBO1FBQ0wsNkVBQWEsQ0FBQTtRQUNiLHlFQUFXLENBQUE7SUFDZixDQUFDLEVBSlcsa0JBQWtCLEdBQWxCLDBCQUFrQixLQUFsQiwwQkFBa0IsUUFJN0I7SUEwQ1ksUUFBQSxRQUFRLEdBQW1DO1FBQ3BELEtBQUssRUFBRTtZQUNILFdBQVcsRUFBRSxDQUFDLHlCQUFlLENBQUMsS0FBSyxDQUFDO1lBQ3BDLFlBQVksRUFBRSxNQUFNO1NBQ3ZCO1FBQ0QsUUFBUSxFQUFFO1lBQ04sV0FBVyxFQUFFLENBQUMseUJBQWUsQ0FBQyxXQUFXLENBQUM7WUFDMUMsT0FBTyxFQUFFLHlCQUFlLENBQUMsV0FBVztTQUN2QztRQUNELEtBQUssRUFBRTtZQUNILFdBQVcsRUFBRTtnQkFDVCxvQkFBVSxDQUFDLFdBQVc7Z0JBQ3RCLG9CQUFVLENBQUMsU0FBUztnQkFDcEIsb0JBQVUsQ0FBQyxpQkFBaUI7Z0JBQzVCLG9CQUFVLENBQUMsV0FBVztnQkFDdEIsb0JBQVUsQ0FBQyxnQkFBZ0I7YUFDOUI7WUFDRCxhQUFhLEVBQUUsSUFBSTtZQUNuQixNQUFNLEVBQUUsQ0FBQyxJQUFXLEVBQUUsTUFBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FB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