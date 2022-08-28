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
        constructor(tarsInstance) {
            super(tarsInstance);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelItem)))
                .append(this.dropdownItemType = new ItemDropdown_1.default(this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.AcquireItemDropdown] ?? IItem_1.ItemType.Branch)
                .event.subscribe("selection", async (_, selection) => {
                this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.AcquireItemDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonAquireItem))
                .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonAquireItemTooltip))))
                .event.subscribe("activate", async () => {
                await this.tarsInstance.activateManualMode(new AcquireItem_1.AcquireItemMode(this.dropdownItemType.selection));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelDoodad)))
                .append(this.dropdownDoodadType = new DoodadDropdown_1.default(this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.BuildDoodadDropdown] ?? IDoodad_1.DoodadType.GraniteCampfire)
                .event.subscribe("selection", async (_, selection) => {
                this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.BuildDoodadDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonBuildDoodad))
                .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonBuildDoodadTooltip))))
                .event.subscribe("activate", async () => {
                await this.tarsInstance.activateManualMode(new BuildDoodad_1.BuildDoodadMode(this.dropdownDoodadType.selection));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelCreature)))
                .append(this.dropdownCreature = new CreatureDropdown_1.default(this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.TameCreatureDropdown] ?? ICreature_1.CreatureType.Rabbit)
                .event.subscribe("selection", async (_, selection) => {
                this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.TameCreatureDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonTameCreature))
                .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonTameCreatureTooltip))))
                .event.subscribe("activate", async () => {
                await this.tarsInstance.activateManualMode(new TameCreature_1.TameCreatureMode(this.dropdownCreature.selection));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonSailToCivilization))
                .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonSailToCivilizationTooltip))))
                .event.subscribe("activate", async () => {
                await this.tarsInstance.activateManualMode(new ExecuteObjectives_1.ExecuteObjectivesMode([new SailToCivilization_1.default()]));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza3NQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91aS9wYW5lbHMvVGFza3NQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFxQkEsTUFBcUIsVUFBVyxTQUFRLG1CQUFTO1FBTTdDLFlBQVksWUFBa0I7WUFDMUIsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXBCLElBQUkseUJBQVcsRUFBRTtpQkFDWixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDO2lCQUM3QixRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO2lCQUNyRixNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsNEJBQWlCLENBQUMsbUJBQW1CLENBQUMsSUFBSSxnQkFBUSxDQUFDLE1BQU0sQ0FBQztpQkFDcEksS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRTtnQkFDakQsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLDRCQUFpQixDQUFDLG1CQUFtQixDQUFDLEdBQUcsU0FBUyxDQUFDO1lBQ3JGLENBQUMsQ0FBQyxDQUFDO2lCQUNOLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVwQixJQUFJLGdCQUFNLEVBQUU7aUJBQ1AsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2lCQUNuRSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFD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