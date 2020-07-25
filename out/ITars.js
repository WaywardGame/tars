define(["require", "exports", "doodad/IDoodad", "entity/action/IAction", "entity/IHuman", "item/IItem"], function (require, exports, IDoodad_1, IAction_1, IHuman_1, IItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.inventoryItemInfo = exports.InventoryItemFlag = exports.baseInfo = exports.desertCutoff = exports.gardenMaxTilesChecked = exports.defaultMaxTilesChecked = void 0;
    exports.defaultMaxTilesChecked = 3000;
    exports.gardenMaxTilesChecked = 1024;
    exports.desertCutoff = Number.MAX_SAFE_INTEGER;
    exports.baseInfo = {
        anvil: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.Anvil],
            placeNear: "kiln",
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
                    .sort((a, b) => a.weight > b.weight ? 1 : -1);
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
        },
        well: {
            doodadTypes: [IDoodad_1.DoodadTypeGroup.Well],
            allowMultiple: true,
        },
    };
    var InventoryItemFlag;
    (function (InventoryItemFlag) {
        InventoryItemFlag[InventoryItemFlag["PreferHigherWorth"] = 0] = "PreferHigherWorth";
        InventoryItemFlag[InventoryItemFlag["PreferLowerWeight"] = 1] = "PreferLowerWeight";
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
        },
        bed: {
            itemTypes: [IItem_1.ItemTypeGroup.Bedding],
        },
        campfire: {
            itemTypes: [IItem_1.ItemTypeGroup.Campfire],
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
                IItem_1.ItemType.CopperShield,
                IItem_1.ItemType.IronShield,
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
        fireStoker: {
            useTypes: [IAction_1.ActionType.StokeFire],
            flags: InventoryItemFlag.PreferLowerWeight,
        },
        furnace: {
            itemTypes: [IItem_1.ItemTypeGroup.Furnace],
        },
        hammer: {
            itemTypes: [IItem_1.ItemTypeGroup.Hammer],
        },
        hoe: {
            useTypes: [IAction_1.ActionType.Till],
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
        },
        tongs: {
            itemTypes: [IItem_1.ItemTypeGroup.Tongs],
        },
        pickAxe: {
            itemTypes: [
                IItem_1.ItemType.CopperPickaxe,
                IItem_1.ItemType.IronPickaxe,
                IItem_1.ItemType.StonePickaxe,
                IItem_1.ItemType.WroughtIronPickaxe,
            ],
        },
        shovel: {
            useTypes: [IAction_1.ActionType.Dig],
        },
        waterContainer: {
            useTypes: [IAction_1.ActionType.GatherWater],
            itemTypes: [
                IItem_1.ItemTypeGroup.ContainerOfDesalinatedWater,
                IItem_1.ItemTypeGroup.ContainerOfMedicinalWater,
                IItem_1.ItemTypeGroup.ContainerOfPurifiedFreshWater,
                IItem_1.ItemTypeGroup.ContainerOfSeawater,
                IItem_1.ItemTypeGroup.ContainerOfUnpurifiedFreshWater,
            ],
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVdhLFFBQUEsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO0lBRTlCLFFBQUEscUJBQXFCLEdBQUcsSUFBSSxDQUFDO0lBRTdCLFFBQUEsWUFBWSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztJQWlDdkMsUUFBQSxRQUFRLEdBQW1DO1FBQ3ZELEtBQUssRUFBRTtZQUNOLFdBQVcsRUFBRSxDQUFDLHlCQUFlLENBQUMsS0FBSyxDQUFDO1lBQ3BDLFNBQVMsRUFBRSxNQUFNO1NBQ2pCO1FBQ0QsUUFBUSxFQUFFO1lBQ1QsV0FBVyxFQUFFLENBQUMseUJBQWUsQ0FBQyxXQUFXLENBQUM7WUFDMUMsT0FBTyxFQUFFLHlCQUFlLENBQUMsV0FBVztTQUNwQztRQUNELEtBQUssRUFBRTtZQUNOLFdBQVcsRUFBRTtnQkFDWixvQkFBVSxDQUFDLFdBQVc7Z0JBQ3RCLG9CQUFVLENBQUMsU0FBUztnQkFDcEIsb0JBQVUsQ0FBQyxpQkFBaUI7Z0JBQzVCLG9CQUFVLENBQUMsV0FBVztnQkFDdEIsb0JBQVUsQ0FBQyxnQkFBZ0I7YUFDM0I7WUFDRCxhQUFhLEVBQUUsSUFBSTtZQUNuQixNQUFNLEVBQUUsQ0FBQyxJQUFXLEVBQUUsTUFBYyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0RixLQUFLLEVBQUUsQ0FBQyxJQUFXLEVBQUUsRUFBRTtnQkFDdEIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztZQUNoQyxDQUFDO1NBQ0Q7UUFDRCxPQUFPLEVBQUU7WUFDUixXQUFXLEVBQUUsQ0FBQyx5QkFBZSxDQUFDLFVBQVUsQ0FBQztZQUN6QyxPQUFPLEVBQUUseUJBQWUsQ0FBQyxVQUFVO1NBQ25DO1FBQ0QsaUJBQWlCLEVBQUU7WUFD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