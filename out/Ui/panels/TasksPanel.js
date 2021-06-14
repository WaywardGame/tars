var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "game/item/IItem", "ui/component/Button", "ui/component/dropdown/ItemDropdown", "ui/component/dropdown/DoodadDropdown", "ui/component/LabelledRow", "ui/component/Divider", "game/doodad/IDoodad", "../../ITars", "../../mode/modes/AcquireItem", "../components/TarsPanel", "../../mode/modes/BuildDoodad"], function (require, exports, IItem_1, Button_1, ItemDropdown_1, DoodadDropdown_1, LabelledRow_1, Divider_1, IDoodad_1, ITars_1, AcquireItem_1, TarsPanel_1, BuildDoodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TasksPanel extends TarsPanel_1.default {
        constructor() {
            var _a, _b;
            super();
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText(ITars_1.getTarsTranslation(ITars_1.TarsTranslation.DialogLabelItem)))
                .append(this.dropdownItemType = new ItemDropdown_1.default((_a = this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.AcquireItemDropdown]) !== null && _a !== void 0 ? _a : IItem_1.ItemType.Branch)
                .event.subscribe("selection", async (_, selection) => {
                this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.AcquireItemDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText(ITars_1.getTarsTranslation(ITars_1.TarsTranslation.DialogButtonAquireItem))
                .setTooltip(tooltip => tooltip.addText(text => text.setText(ITars_1.getTarsTranslation(ITars_1.TarsTranslation.DialogButtonAquireItemTooltip))))
                .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new AcquireItem_1.AcquireItemMode(this.dropdownItemType.selection));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText(ITars_1.getTarsTranslation(ITars_1.TarsTranslation.DialogLabelDoodad)))
                .append(this.dropdownDoodadType = new DoodadDropdown_1.default((_b = this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.BuildDoodadDropdown]) !== null && _b !== void 0 ? _b : IDoodad_1.DoodadType.StoneCampfire)
                .event.subscribe("selection", async (_, selection) => {
                this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.BuildDoodadDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText(ITars_1.getTarsTranslation(ITars_1.TarsTranslation.DialogButtonBuildDoodad))
                .setTooltip(tooltip => tooltip.addText(text => text.setText(ITars_1.getTarsTranslation(ITars_1.TarsTranslation.DialogButtonBuildDoodadTooltip))))
                .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new BuildDoodad_1.BuildDoodadMode(this.dropdownDoodadType.selection));
                return true;
            })
                .appendTo(this);
        }
        getTranslation() {
            return ITars_1.TarsTranslation.DialogPanelTasks;
        }
        onSwitchTo() {
        }
        refresh() {
        }
    }
    __decorate([
        Bound
    ], TasksPanel.prototype, "refresh", null);
    exports.default = TasksPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza3NQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91aS9wYW5lbHMvVGFza3NQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFjQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFLN0M7O1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLHlCQUFXLEVBQUU7aUJBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztpQkFDN0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQywwQkFBa0IsQ0FBQyx1QkFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7aUJBQ3JGLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxzQkFBWSxDQUFDLE1BQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHlCQUFpQixDQUFDLG1CQUFtQixDQUFDLG1DQUFJLGdCQUFRLENBQUMsTUFBTSxDQUFDO2lCQUM1SCxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFO2dCQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMseUJBQWlCLENBQUMsbUJBQW1CLENBQUMsR0FBRyxTQUFTLENBQUM7WUFDN0UsQ0FBQyxDQUFDLENBQUM7aUJBQ04sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBCLElBQUksZ0JBQU0sRUFBRTtpQkFDUCxPQUFPLENBQUMsMEJBQWtCLENBQUMsdUJBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2lCQUNuRSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQywwQkFBa0IsQ0FBQyx1QkFBZSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMvSCxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxLQUFLLElBQUksRUFBRTtnQkFDcEMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksNkJBQWUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBcUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JHLE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUMsQ0FBQztpQkFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFcEIsSUFBSSxpQkFBTyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRzdCLElBQUkseUJBQVcsRUFBRTtpQkFDWixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDO2lCQUM3QixRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLDBCQUFrQixDQUFDLHVCQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2lCQUN2RixNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksd0JBQWMsQ0FBQyxNQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyx5QkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxtQ0FBSSxvQkFBVSxDQUFDLGFBQWEsQ0FBQztpQkFDekksS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRTtnQkFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHlCQUFpQixDQUFDLG1CQUFtQixDQUFDLEdBQUcsU0FBUyxDQUFDO1lBQzdFLENBQUMsQ0FBQyxDQUFDO2lCQUNOLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVwQixJQUFJLGdCQUFNLEVBQUU7aUJBQ1AsT0FBTyxDQUFDLDBCQUFrQixDQUFDLHVCQUFlLENBQUMsdUJBQXVCLENBQUMsQ0FBQztpQkFDcEUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsMEJBQWtCLENBQUMsdUJBQWUsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDaEksS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ3BDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLDZCQUFlLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQXVCLENBQUMsQ0FBQyxDQUFDO2dCQUN6RyxPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDLENBQUM7aUJBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLENBQUM7UUFFTSxjQUFjO1lBQ2pCLE9BQU8sdUJBQWUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM1QyxDQUFDO1FBRVMsVUFBVTtRQUNwQixDQUFDO1FBR1MsT0FBTztRQUNqQixDQUFDO0tBQ0o7SUFGRztRQURDLEtBQUs7NkNBRUw7SUF6REwsNkJBMERDIn0=