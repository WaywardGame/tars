var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "game/item/IItem", "ui/component/Button", "ui/component/dropdown/ItemDropdown", "ui/component/dropdown/DoodadDropdown", "ui/component/LabelledRow", "ui/component/Divider", "game/doodad/IDoodad", "utilities/Decorators", "../../modes/AcquireItem", "../components/TarsPanel", "../../modes/BuildDoodad", "../../ITarsMod"], function (require, exports, IItem_1, Button_1, ItemDropdown_1, DoodadDropdown_1, LabelledRow_1, Divider_1, IDoodad_1, Decorators_1, AcquireItem_1, TarsPanel_1, BuildDoodad_1, ITarsMod_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TasksPanel extends TarsPanel_1.default {
        constructor() {
            var _a, _b;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza3NQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91aS9wYW5lbHMvVGFza3NQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFlQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFLN0M7O1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLHlCQUFXLEVBQUU7aUJBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztpQkFDN0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztpQkFDckYsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLHNCQUFZLENBQUMsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsNEJBQWlCLENBQUMsbUJBQW1CLENBQUMsbUNBQUksZ0JBQVEsQ0FBQyxNQUFNLENBQUM7aUJBQy9ILEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUU7Z0JBQ2pELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyw0QkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLFNBQVMsQ0FBQztZQUNoRixDQUFDLENBQUMsQ0FBQztpQkFDTixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFcEIsSUFBSSxnQkFBTSxFQUFFO2lCQUNQLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMsc0JBQXNCLENBQUMsQ0FBQztpQkFDbkUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBQSw2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