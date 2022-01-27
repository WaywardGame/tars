var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "game/item/IItem", "ui/component/Button", "ui/component/dropdown/ItemDropdown", "ui/component/dropdown/DoodadDropdown", "ui/component/dropdown/CreatureDropdown", "ui/component/LabelledRow", "ui/component/Divider", "game/doodad/IDoodad", "utilities/Decorators", "game/entity/creature/ICreature", "../../modes/AcquireItem", "../components/TarsPanel", "../../modes/BuildDoodad", "../../ITarsMod", "../../modes/ExecuteObjectives", "../../objectives/utility/SailToCivilization", "../../modes/TameCreature"], function (require, exports, IItem_1, Button_1, ItemDropdown_1, DoodadDropdown_1, CreatureDropdown_1, LabelledRow_1, Divider_1, IDoodad_1, Decorators_1, ICreature_1, AcquireItem_1, TarsPanel_1, BuildDoodad_1, ITarsMod_1, ExecuteObjectives_1, SailToCivilization_1, TameCreature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TasksPanel extends TarsPanel_1.default {
        constructor() {
            var _a, _b, _c;
            super();
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelItem)))
                .append(this.dropdownItemType = new ItemDropdown_1.default((_a = this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.AcquireItemDropdown]) !== null && _a !== void 0 ? _a : IItem_1.ItemType.Branch)
                .event.subscribe("selection", async (_, selection) => {
                this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.AcquireItemDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonAquireItem))
                .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonAquireItemTooltip))))
                .event.subscribe("activate", async () => {
                var _a;
                await ((_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.activateManualMode(new AcquireItem_1.AcquireItemMode(this.dropdownItemType.selection)));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelDoodad)))
                .append(this.dropdownDoodadType = new DoodadDropdown_1.default((_b = this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.BuildDoodadDropdown]) !== null && _b !== void 0 ? _b : IDoodad_1.DoodadType.StoneCampfire)
                .event.subscribe("selection", async (_, selection) => {
                this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.BuildDoodadDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonBuildDoodad))
                .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonBuildDoodadTooltip))))
                .event.subscribe("activate", async () => {
                var _a;
                await ((_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.activateManualMode(new BuildDoodad_1.BuildDoodadMode(this.dropdownDoodadType.selection)));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelCreature)))
                .append(this.dropdownCreature = new CreatureDropdown_1.default((_c = this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.TameCreatureDropdown]) !== null && _c !== void 0 ? _c : ICreature_1.CreatureType.Rabbit)
                .event.subscribe("selection", async (_, selection) => {
                this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.TameCreatureDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonTameCreature))
                .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonTameCreatureTooltip))))
                .event.subscribe("activate", async () => {
                var _a;
                await ((_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.activateManualMode(new TameCreature_1.TameCreatureMode(this.dropdownCreature.selection)));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonSailToCivilization))
                .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonSailToCivilizationTooltip))))
                .event.subscribe("activate", async () => {
                var _a;
                await ((_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.activateManualMode(new ExecuteObjectives_1.ExecuteObjectivesMode([new SailToCivilization_1.default()])));
                return true;
            })
                .appendTo(this);
        }
        getTranslation() {
            return ITarsMod_1.TarsTranslation.DialogPanelTasks;
        }
        onSwitchTo() {
        }
        refresh() {
        }
    }
    __decorate([
        Decorators_1.Bound
    ], TasksPanel.prototype, "refresh", null);
    exports.default = TasksPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza3NQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91aS9wYW5lbHMvVGFza3NQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFvQkEsTUFBcUIsVUFBVyxTQUFRLG1CQUFTO1FBTTdDOztZQUNJLEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSx5QkFBVyxFQUFFO2lCQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7aUJBQzdCLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBQSw2QkFBa0IsRUFBQywwQkFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7aUJBQ3JGLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxzQkFBWSxDQUFDLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLDRCQUFpQixDQUFDLG1CQUFtQixDQUFDLG1DQUFJLGdCQUFRLENBQUMsTUFBTSxDQUFDO2lCQUMvSCxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFO2dCQUNqRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsNEJBQWlCLENBQUMsbUJBQW1CLENBQUMsR0FBRyxTQUFTLENBQUM7WUFDaEYsQ0FBQyxDQUFDLENBQUM7aUJBQ04sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBCLElBQUksZ0JBQU0sRUFBRTtpQkFDUCxPQUFPLENBQUMsSUFBQSw2QkFBa0IsRUFBQywwQkFBZSxDQUFDLHNCQUFzQixDQUFDLENBQUM7aUJBQ25FLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUEs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