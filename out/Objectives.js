define(["require", "exports", "./IObjective", "./Objectives/AcquireItem", "./Objectives/Build", "./Objectives/DefendAgainstCreature", "./Objectives/GatherDoodad", "./Objectives/GatherFromCreature", "./Objectives/GatherFromTerrain", "./Objectives/GatherWater", "./Objectives/PlantSeed", "./Objectives/RecoverHunger", "./Objectives/RecoverStamina", "./Objectives/RecoverThirst", "./Objectives/ReduceWeight", "./Objectives/Rest", "./Objectives/UseItem"], function (require, exports, IObjective_1, AcquireItem_1, Build_1, DefendAgainstCreature_1, GatherDoodad_1, GatherFromCreature_1, GatherFromTerrain_1, GatherWater_1, PlantSeed_1, RecoverHunger_1, RecoverStamina_1, RecoverThirst_1, ReduceWeight_1, Rest_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const objectives = [];
    exports.default = objectives;
    objectives[IObjective_1.ObjectiveType.AcquireItem] = AcquireItem_1.default;
    objectives[IObjective_1.ObjectiveType.Build] = Build_1.default;
    objectives[IObjective_1.ObjectiveType.DefendAgainstCreature] = DefendAgainstCreature_1.default;
    objectives[IObjective_1.ObjectiveType.GatherDoodad] = GatherDoodad_1.default;
    objectives[IObjective_1.ObjectiveType.GatherFromCreature] = GatherFromCreature_1.default;
    objectives[IObjective_1.ObjectiveType.GatherFromTerrain] = GatherFromTerrain_1.default;
    objectives[IObjective_1.ObjectiveType.GatherWater] = GatherWater_1.default;
    objectives[IObjective_1.ObjectiveType.PlantSeed] = PlantSeed_1.default;
    objectives[IObjective_1.ObjectiveType.RecoverHunger] = RecoverHunger_1.default;
    objectives[IObjective_1.ObjectiveType.RecoverStamina] = RecoverStamina_1.default;
    objectives[IObjective_1.ObjectiveType.RecoverThirst] = RecoverThirst_1.default;
    objectives[IObjective_1.ObjectiveType.ReduceWeight] = ReduceWeight_1.default;
    objectives[IObjective_1.ObjectiveType.Rest] = Rest_1.default;
    objectives[IObjective_1.ObjectiveType.UseItem] = UseItem_1.default;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PYmplY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQW9CQSxNQUFNLFVBQVUsR0FBeUMsRUFBRSxDQUFDO0lBQzVELGtCQUFlLFVBQVUsQ0FBQztJQUUxQixVQUFVLENBQUMsMEJBQWEsQ0FBQyxXQUFXLENBQUMsR0FBRyxxQkFBVyxDQUFDO0lBQ3BELFVBQVUsQ0FBQywwQkFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUssQ0FBQztJQUN4QyxVQUFVLENBQUMsMEJBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLCtCQUFxQixDQUFDO0lBQ3hFLFVBQVUsQ0FBQywwQkFBYSxDQUFDLFlBQVksQ0FBQyxHQUFHLHNCQUFZLENBQUM7SUFDdEQsVUFBVSxDQUFDLDBCQUFhLENBQUMsa0JBQWtCLENBQUMsR0FBRyw0QkFBa0IsQ0FBQztJQUNsRSxVQUFVLENBQUMsMEJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLDJCQUFpQixDQUFDO0lBQ2hFLFVBQVUsQ0FBQywwQkFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLHFCQUFXLENBQUM7SUFDcEQsVUFBVSxDQUFDLDBCQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsbUJBQVMsQ0FBQztJQUNoRCxVQUFVLENBQUMsMEJBQWEsQ0FBQyxhQUFhLENBQUMsR0FBRyx1QkFBYSxDQUFDO0lBQ3hELFVBQVUsQ0FBQywwQkFBYSxDQUFDLGNBQWMsQ0FBQyxHQUFHLHdCQUFjLENBQUM7SUFDMUQsVUFBVSxDQUFDLDBCQUFhLENBQUMsYUFBYSxDQUFDLEdBQUcsdUJBQWEsQ0FBQztJQUN4RCxVQUFVLENBQUMsMEJBQWEsQ0FBQyxZQUFZLENBQUMsR0FBRyxzQkFBWSxDQUFDO0lBQ3RELFVBQVUsQ0FBQywwQkFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLGNBQUksQ0FBQztJQUN0QyxVQUFVLENBQUMsMEJBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxpQkFBTyxDQUFDIn0=