define(["require", "exports", "doodad/IDoodad", "entity/action/IAction", "entity/IHuman", "item/IItem"], function (require, exports, IDoodad_1, IAction_1, IHuman_1, IItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV2EsUUFBQSxzQkFBc0IsR0FBRyxJQUFJLENBQUM7SUFFOUIsUUFBQSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7SUFFN0IsUUFBQSxZQUFZLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO0lBaUN2QyxRQUFBLFFBQVEsR0FBbUM7UUFDdkQsS0FBSyxFQUFFO1lBQ04sV0FBVyxFQUFFLENBQUMseUJBQWUsQ0FBQyxLQUFLLENBQUM7WUFDcEMsU0FBUyxFQUFFLE1BQU07U0FDakI7UUFDRCxRQUFRLEVBQUU7WUFDVCxXQUFXLEVBQUUsQ0FBQyx5QkFBZSxDQUFDLFdBQVcsQ0FBQztZQUMxQyxPQUFPLEVBQUUseUJBQWUsQ0FBQyxXQUFXO1NBQ3BDO1FBQ0QsS0FBSyxFQUFFO1lBQ04sV0FBVyxFQUFFO2dCQUNaLG9CQUFVLENBQUMsV0FBVztnQkFDdEIsb0JBQVUsQ0FBQyxTQUFTO2dCQUNwQixvQkFBVSxDQUFDLGlCQUFpQjtnQkFDNUIsb0JBQVUsQ0FBQyxXQUFXO2dCQUN0QixvQkFBVSxDQUFDLGdCQUFnQjthQUMzQjtZQUNELGFBQWEsRUFBRSxJQUFJO1lBQ25CLE1BQU0sRUFBRSxDQUFDLElBQVcsRUFBRSxNQUFjLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RGLEtBQUssRUFBRSxDQUFDLElBQVcsRUFBRSxFQUFFO2dCQUN0QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1lBQ2hDLENBQUM7U0FDRDtRQUNELE9BQU8sRUFBRTtZQUNSLFdBQVcsRUFBRSxDQUFDLHlCQUFlLENBQUMsVUFBVSxDQUFDO1lBQ3pDLE9BQU8sRUFBRSx5QkFBZSxDQUFDLFVBQVU7U0FDbkM7UUFDRCxpQkFBaUIsRUFBRTtZQUNs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