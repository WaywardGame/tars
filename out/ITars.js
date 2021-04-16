define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IHuman", "game/item/IItem", "./Utilities/Item"], function (require, exports, IDoodad_1, IAction_1, IHuman_1, IItem_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TarsTranslation = exports.inventoryItemInfo = exports.InventoryItemFlag = exports.baseInfo = exports.gardenMaxTilesChecked = exports.defaultMaxTilesChecked = exports.TARS_ID = void 0;
    exports.TARS_ID = "TARS";
    exports.defaultMaxTilesChecked = 3000;
    exports.gardenMaxTilesChecked = 1024;
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
        InventoryItemFlag[InventoryItemFlag["PreferLowerWeight"] = 1] = "PreferLowerWeight";
        InventoryItemFlag[InventoryItemFlag["PreferHigherDurability"] = 2] = "PreferHigherDurability";
        InventoryItemFlag[InventoryItemFlag["PreferHigherDecay"] = 3] = "PreferHigherDecay";
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
        },
        campfire: {
            itemTypes: [IItem_1.ItemTypeGroup.Campfire],
        },
        carve: {
            actionTypes: [IAction_1.ActionType.Carve],
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
            itemTypes: Array.from(Item_1.foodItemTypes),
            flags: InventoryItemFlag.PreferHigherDecay,
            allowMultiple: 5,
        },
        furnace: {
            itemTypes: [IItem_1.ItemTypeGroup.Furnace],
        },
        hammer: {
            itemTypes: [IItem_1.ItemTypeGroup.Hammer],
        },
        heal: {
            actionTypes: [IAction_1.ActionType.Heal],
        },
        hoe: {
            actionTypes: [IAction_1.ActionType.Till],
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
        sailBoat: {
            itemTypes: [IItem_1.ItemType.Sailboat],
            allowInChests: true,
        },
        shovel: {
            actionTypes: [IAction_1.ActionType.Dig],
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
            allowMultiple: 3,
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
    var TarsTranslation;
    (function (TarsTranslation) {
        TarsTranslation[TarsTranslation["DialogTitleMain"] = 0] = "DialogTitleMain";
        TarsTranslation[TarsTranslation["DialogButtonEnable"] = 1] = "DialogButtonEnable";
        TarsTranslation[TarsTranslation["DialogLabelStatus"] = 2] = "DialogLabelStatus";
        TarsTranslation[TarsTranslation["DialogStatusNavigatingInitializing"] = 3] = "DialogStatusNavigatingInitializing";
    })(TarsTranslation = exports.TarsTranslation || (exports.TarsTranslation = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQWdCYSxRQUFBLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFFakIsUUFBQSxzQkFBc0IsR0FBRyxJQUFJLENBQUM7SUFFOUIsUUFBQSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7SUF1QzdCLFFBQUEsUUFBUSxHQUFtQztRQUN2RCxLQUFLLEVBQUU7WUFDTixXQUFXLEVBQUUsQ0FBQyx5QkFBZSxDQUFDLEtBQUssQ0FBQztZQUNwQyxZQUFZLEVBQUUsTUFBTTtTQUVwQjtRQUNELFFBQVEsRUFBRTtZQUNULFdBQVcsRUFBRSxDQUFDLHlCQUFlLENBQUMsV0FBVyxDQUFDO1lBQzFDLE9BQU8sRUFBRSx5QkFBZSxDQUFDLFdBQVc7U0FDcEM7UUFDRCxLQUFLLEVBQUU7WUFDTixXQUFXLEVBQUU7Z0JBQ1osb0JBQVUsQ0FBQyxXQUFXO2dCQUN0QixvQkFBVSxDQUFDLFNBQVM7Z0JBQ3BCLG9CQUFVLENBQUMsaUJBQWlCO2dCQUM1QixvQkFBVSxDQUFDLFdBQVc7Z0JBQ3RCLG9CQUFVLENBQUMsZ0JBQWdCO2FBQzNCO1lBQ0QsYUFBYSxFQUFFLElBQUk7WUFDbkIsTUFBTSxFQUFFLENBQUMsSUFBVyxFQUFFLE1BQWMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEYsS0FBSyxFQUFFLENBQUMsSUFBVyxFQUFFLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFDaEMsQ0FBQztTQUNEO1FBQ0QsT0FBTyxFQUFFO1lBQ1IsV0FBVyxFQUFFLENBQUMseUJBQWUsQ0FBQyxVQUFVLENBQUM7WUFDekMsT0FBTyxFQUFFLHlCQUFlLENBQUMsVUFBVTtTQUNuQztRQUNELGlCQUFpQixFQUFFO1lBQ2xCLFdBQVcsRUFB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