define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IHuman", "game/item/IItem", "../objectives/acquire/item/AcquireItem", "../objectives/acquire/item/AcquireItemByGroup", "../objectives/acquire/item/AcquireItemForAction", "../objectives/acquire/item/AcquireItemForDoodad", "../objectives/analyze/AnalyzeBase", "../objectives/analyze/AnalyzeInventory", "../objectives/other/item/BuildItem", "../objectives/other/item/EquipItem", "../utilities/Logger"], function (require, exports, IDoodad_1, IAction_1, IHuman_1, IItem_1, AcquireItem_1, AcquireItemByGroup_1, AcquireItemForAction_1, AcquireItemForDoodad_1, AnalyzeBase_1, AnalyzeInventory_1, BuildItem_1, EquipItem_1, Logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCommonInitialObjectives = void 0;
    async function getCommonInitialObjectives(context) {
        const objectives = [];
        if (context.inventory.axe === undefined) {
            objectives.push([new AcquireItem_1.default(IItem_1.ItemType.StoneAxe), new AnalyzeInventory_1.default()]);
        }
        if (context.inventory.pickAxe === undefined) {
            objectives.push([new AcquireItem_1.default(IItem_1.ItemType.StonePickaxe), new AnalyzeInventory_1.default()]);
        }
        if (context.base.campfire.length === 0 && context.inventory.campfire === undefined) {
            Logger_1.log.info("Need campfire");
            objectives.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadTypeGroup.LitCampfire), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
        }
        if (context.inventory.fireStarter === undefined) {
            Logger_1.log.info("Need fire starter");
            objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.StartFire), new AnalyzeInventory_1.default()]);
        }
        if (context.inventory.fireKindling === undefined || context.inventory.fireKindling.length === 0) {
            Logger_1.log.info("Need fire kindling");
            objectives.push([new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.Kindling), new AnalyzeInventory_1.default()]);
        }
        if (context.inventory.fireTinder === undefined) {
            Logger_1.log.info("Need fire tinder");
            objectives.push([new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.Tinder), new AnalyzeInventory_1.default()]);
        }
        if (context.inventory.shovel === undefined) {
            objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.Dig), new AnalyzeInventory_1.default()]);
        }
        if (context.inventory.knife === undefined) {
            objectives.push([new AcquireItem_1.default(IItem_1.ItemType.StoneKnife), new AnalyzeInventory_1.default()]);
        }
        if (context.inventory.bed === undefined) {
            objectives.push([new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.Bedding), new AnalyzeInventory_1.default()]);
        }
        if (context.inventory.equipSword === undefined) {
            objectives.push([new AcquireItem_1.default(IItem_1.ItemType.WoodenSword), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.LeftHand)]);
        }
        const chest = context.human.getEquippedItem(IHuman_1.EquipType.Chest);
        if (chest === undefined || chest.type === IItem_1.ItemType.TatteredClothShirt) {
            objectives.push([new AcquireItem_1.default(IItem_1.ItemType.BarkTunic), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.Chest)]);
        }
        const legs = context.human.getEquippedItem(IHuman_1.EquipType.Legs);
        if (legs === undefined || legs.type === IItem_1.ItemType.TatteredClothTrousers) {
            objectives.push([new AcquireItem_1.default(IItem_1.ItemType.BarkLeggings), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.Legs)]);
        }
        if (context.inventory.equipShield === undefined) {
            objectives.push([new AcquireItem_1.default(IItem_1.ItemType.WoodenShield), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.RightHand)]);
        }
        return objectives;
    }
    exports.getCommonInitialObjectives = getCommonInitialObjectives;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbW9uSW5pdGlhbE9iamVjdGl2ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvQ29tbW9uSW5pdGlhbE9iamVjdGl2ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQWlCTyxLQUFLLFVBQVUsMEJBQTBCLENBQUMsT0FBZ0I7UUFDN0QsTUFBTSxVQUFVLEdBQXFDLEVBQUUsQ0FBQztRQUV4RCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLFNBQVMsRUFBRTtZQUNyQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSwwQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNqRjtRQUVELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO1lBQ3pDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3JGO1FBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtZQUNoRixZQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzFCLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDhCQUFvQixDQUFDLHlCQUFlLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxtQkFBUyxFQUFFLEVBQUUsSUFBSSxxQkFBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2hIO1FBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7WUFDN0MsWUFBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxD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