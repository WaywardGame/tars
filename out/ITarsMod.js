define(["require", "exports", "game/entity/IStats"], function (require, exports, IStats_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uiConfigurableOptions = exports.TarsTranslation = exports.TarsUiSaveDataKey = exports.getTarsSaveData = exports.getTarsTranslation = exports.setTarsMod = exports.getTarsMod = exports.TARS_ID = void 0;
    exports.TARS_ID = "TARS";
    let tarsMod;
    function getTarsMod() {
        if (!tarsMod) {
            throw new Error("Invalid Tars instance");
        }
        return tarsMod;
    }
    exports.getTarsMod = getTarsMod;
    function setTarsMod(instance) {
        tarsMod = instance;
    }
    exports.setTarsMod = setTarsMod;
    function getTarsTranslation(translation) {
        return getTarsMod().getTranslation(translation);
    }
    exports.getTarsTranslation = getTarsTranslation;
    function getTarsSaveData(key) {
        return getTarsMod().saveData[key];
    }
    exports.getTarsSaveData = getTarsSaveData;
    var TarsUiSaveDataKey;
    (function (TarsUiSaveDataKey) {
        TarsUiSaveDataKey[TarsUiSaveDataKey["DialogOpened"] = 0] = "DialogOpened";
        TarsUiSaveDataKey[TarsUiSaveDataKey["ActivePanelId"] = 1] = "ActivePanelId";
        TarsUiSaveDataKey[TarsUiSaveDataKey["AcquireItemDropdown"] = 2] = "AcquireItemDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["BuildDoodadDropdown"] = 3] = "BuildDoodadDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToIslandDropdown"] = 4] = "MoveToIslandDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToTerrainDropdown"] = 5] = "MoveToTerrainDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToDoodadDropdown"] = 6] = "MoveToDoodadDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToPlayerDropdown"] = 7] = "MoveToPlayerDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToNPCDropdown"] = 8] = "MoveToNPCDropdown";
    })(TarsUiSaveDataKey = exports.TarsUiSaveDataKey || (exports.TarsUiSaveDataKey = {}));
    var TarsTranslation;
    (function (TarsTranslation) {
        TarsTranslation[TarsTranslation["DialogTitleMain"] = 0] = "DialogTitleMain";
        TarsTranslation[TarsTranslation["DialogStatusNavigatingInitializing"] = 1] = "DialogStatusNavigatingInitializing";
        TarsTranslation[TarsTranslation["DialogPanelGeneral"] = 2] = "DialogPanelGeneral";
        TarsTranslation[TarsTranslation["DialogPanelTasks"] = 3] = "DialogPanelTasks";
        TarsTranslation[TarsTranslation["DialogPanelMoveTo"] = 4] = "DialogPanelMoveTo";
        TarsTranslation[TarsTranslation["DialogPanelOptions"] = 5] = "DialogPanelOptions";
        TarsTranslation[TarsTranslation["DialogButtonAquireItem"] = 6] = "DialogButtonAquireItem";
        TarsTranslation[TarsTranslation["DialogButtonAquireItemTooltip"] = 7] = "DialogButtonAquireItemTooltip";
        TarsTranslation[TarsTranslation["DialogButtonBuildDoodad"] = 8] = "DialogButtonBuildDoodad";
        TarsTranslation[TarsTranslation["DialogButtonBuildDoodadTooltip"] = 9] = "DialogButtonBuildDoodadTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDeveloperMode"] = 10] = "DialogButtonDeveloperMode";
        TarsTranslation[TarsTranslation["DialogButtonDeveloperModeTooltip"] = 11] = "DialogButtonDeveloperModeTooltip";
        TarsTranslation[TarsTranslation["DialogButtonEnable"] = 12] = "DialogButtonEnable";
        TarsTranslation[TarsTranslation["DialogButtonExploreIslands"] = 13] = "DialogButtonExploreIslands";
        TarsTranslation[TarsTranslation["DialogButtonExploreIslandsTooltip"] = 14] = "DialogButtonExploreIslandsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonGoodCitizen"] = 15] = "DialogButtonGoodCitizen";
        TarsTranslation[TarsTranslation["DialogButtonGoodCitizenTooltip"] = 16] = "DialogButtonGoodCitizenTooltip";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurst"] = 17] = "DialogButtonQuantumBurst";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurstTooltip"] = 18] = "DialogButtonQuantumBurstTooltip";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthy"] = 19] = "DialogButtonStayHealthy";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthyTooltip"] = 20] = "DialogButtonStayHealthyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluence"] = 21] = "DialogButtonUseOrbsOfInfluence";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluenceTooltip"] = 22] = "DialogButtonUseOrbsOfInfluenceTooltip";
        TarsTranslation[TarsTranslation["DialogButtonMoveToBase"] = 23] = "DialogButtonMoveToBase";
        TarsTranslation[TarsTranslation["DialogButtonMoveToDoodad"] = 24] = "DialogButtonMoveToDoodad";
        TarsTranslation[TarsTranslation["DialogButtonMoveToIsland"] = 25] = "DialogButtonMoveToIsland";
        TarsTranslation[TarsTranslation["DialogButtonMoveToNPC"] = 26] = "DialogButtonMoveToNPC";
        TarsTranslation[TarsTranslation["DialogButtonMoveToPlayer"] = 27] = "DialogButtonMoveToPlayer";
        TarsTranslation[TarsTranslation["DialogButtonMoveToTerrain"] = 28] = "DialogButtonMoveToTerrain";
        TarsTranslation[TarsTranslation["DialogRangeLabel"] = 29] = "DialogRangeLabel";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThreshold"] = 30] = "DialogRangeRecoverHealthThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThresholdTooltip"] = 31] = "DialogRangeRecoverHealthThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThreshold"] = 32] = "DialogRangeRecoverStaminaThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThresholdTooltip"] = 33] = "DialogRangeRecoverStaminaThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThreshold"] = 34] = "DialogRangeRecoverHungerThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThresholdTooltip"] = 35] = "DialogRangeRecoverHungerThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThreshold"] = 36] = "DialogRangeRecoverThirstThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThresholdTooltip"] = 37] = "DialogRangeRecoverThirstThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogLabelAdvanced"] = 38] = "DialogLabelAdvanced";
        TarsTranslation[TarsTranslation["DialogLabelDoodad"] = 39] = "DialogLabelDoodad";
        TarsTranslation[TarsTranslation["DialogLabelGeneral"] = 40] = "DialogLabelGeneral";
        TarsTranslation[TarsTranslation["DialogLabelIsland"] = 41] = "DialogLabelIsland";
        TarsTranslation[TarsTranslation["DialogLabelItem"] = 42] = "DialogLabelItem";
        TarsTranslation[TarsTranslation["DialogLabelMultiplayer"] = 43] = "DialogLabelMultiplayer";
        TarsTranslation[TarsTranslation["DialogLabelNPC"] = 44] = "DialogLabelNPC";
        TarsTranslation[TarsTranslation["DialogLabelPlayer"] = 45] = "DialogLabelPlayer";
        TarsTranslation[TarsTranslation["DialogLabelRecoverThresholds"] = 46] = "DialogLabelRecoverThresholds";
        TarsTranslation[TarsTranslation["DialogLabelTerrain"] = 47] = "DialogLabelTerrain";
        TarsTranslation[TarsTranslation["DialogModeSurvival"] = 48] = "DialogModeSurvival";
        TarsTranslation[TarsTranslation["DialogModeSurvivalTooltip"] = 49] = "DialogModeSurvivalTooltip";
        TarsTranslation[TarsTranslation["DialogModeTidyUp"] = 50] = "DialogModeTidyUp";
        TarsTranslation[TarsTranslation["DialogModeTidyUpTooltip"] = 51] = "DialogModeTidyUpTooltip";
        TarsTranslation[TarsTranslation["DialogModeGardener"] = 52] = "DialogModeGardener";
        TarsTranslation[TarsTranslation["DialogModeGardenerTooltip"] = 53] = "DialogModeGardenerTooltip";
        TarsTranslation[TarsTranslation["DialogModeTerminator"] = 54] = "DialogModeTerminator";
        TarsTranslation[TarsTranslation["DialogModeTerminatorTooltip"] = 55] = "DialogModeTerminatorTooltip";
        TarsTranslation[TarsTranslation["DialogModeQuest"] = 56] = "DialogModeQuest";
        TarsTranslation[TarsTranslation["DialogModeQuestTooltip"] = 57] = "DialogModeQuestTooltip";
    })(TarsTranslation = exports.TarsTranslation || (exports.TarsTranslation = {}));
    exports.uiConfigurableOptions = [
        TarsTranslation.DialogLabelGeneral,
        {
            option: "exploreIslands",
            title: TarsTranslation.DialogButtonExploreIslands,
            tooltip: TarsTranslation.DialogButtonExploreIslandsTooltip,
        },
        {
            option: "useOrbsOfInfluence",
            title: TarsTranslation.DialogButtonUseOrbsOfInfluence,
            tooltip: TarsTranslation.DialogButtonUseOrbsOfInfluenceTooltip,
        },
        {
            option: "stayHealthy",
            title: TarsTranslation.DialogButtonStayHealthy,
            tooltip: TarsTranslation.DialogButtonStayHealthyTooltip,
        },
        TarsTranslation.DialogLabelMultiplayer,
        {
            option: "goodCitizen",
            title: TarsTranslation.DialogButtonGoodCitizen,
            tooltip: TarsTranslation.DialogButtonGoodCitizenTooltip,
        },
        TarsTranslation.DialogLabelAdvanced,
        {
            option: "quantumBurst",
            title: TarsTranslation.DialogButtonQuantumBurst,
            tooltip: TarsTranslation.DialogButtonQuantumBurstTooltip,
        },
        {
            option: "developerMode",
            title: TarsTranslation.DialogButtonDeveloperMode,
            tooltip: TarsTranslation.DialogButtonDeveloperModeTooltip,
        },
        TarsTranslation.DialogLabelRecoverThresholds,
        {
            option: "recoverThresholdHealth",
            title: TarsTranslation.DialogRangeRecoverHealthThreshold,
            tooltip: TarsTranslation.DialogRangeRecoverHealthThresholdTooltip,
            slider: {
                min: 0,
                max: (context) => context.player.stat.get(IStats_1.Stat.Health).max,
            }
        },
        {
            option: "recoverThresholdStamina",
            title: TarsTranslation.DialogRangeRecoverStaminaThreshold,
            tooltip: TarsTranslation.DialogRangeRecoverStaminaThresholdTooltip,
            slider: {
                min: 0,
                max: (context) => context.player.stat.get(IStats_1.Stat.Stamina).max,
            }
        },
        {
            option: "recoverThresholdHunger",
            title: TarsTranslation.DialogRangeRecoverHungerThreshold,
            tooltip: TarsTranslation.DialogRangeRecoverHungerThresholdTooltip,
            slider: {
                min: 0,
                max: (context) => context.player.stat.get(IStats_1.Stat.Hunger).max,
            }
        },
        {
            option: "recoverThresholdThirst",
            title: TarsTranslation.DialogRangeRecoverThirstThreshold,
            tooltip: TarsTranslation.DialogRangeRecoverThirstThresholdTooltip,
            slider: {
                min: 0,
                max: (context) => context.player.stat.get(IStats_1.Stat.Thirst).max,
            }
        },
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnNNb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnNNb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVNhLFFBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUU5QixJQUFJLE9BQTRCLENBQUM7SUFFakMsU0FBZ0IsVUFBVTtRQUN0QixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQU5ELGdDQU1DO0lBRUQsU0FBZ0IsVUFBVSxDQUFDLFFBQTZCO1FBQ3BELE9BQU8sR0FBRyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUZELGdDQUVDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsV0FBbUQ7UUFDbEYsT0FBTyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUZELGdEQUVDO0lBRUQsU0FBZ0IsZUFBZSxDQUE0QixHQUFNO1FBQzdELE9BQU8sVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFGRCwwQ0FFQztJQTJCRCxJQUFZLGlCQVVYO0lBVkQsV0FBWSxpQkFBaUI7UUFDekIseUVBQVksQ0FBQTtRQUNaLDJFQUFhLENBQUE7UUFDYix1RkFBbUIsQ0FBQTtRQUNuQix1RkFBbUIsQ0FBQTtRQUNuQix5RkFBb0IsQ0FBQTtRQUNwQiwyRkFBcUIsQ0FBQTtRQUNyQix5RkFBb0IsQ0FBQTtRQUNwQix5RkFBb0IsQ0FBQTtRQUNwQixtRkFBaUIsQ0FBQTtJQUNyQixDQUFDLEVBVlcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFVNUI7SUFFRCxJQUFZLGVBa0VYO0lBbEVELFdBQVksZUFBZTtRQUN2QiwyRUFBZSxDQUFBO1FBRWYsaUhBQWtDLENBQUE7UUFFbEMsaUZBQWtCLENB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