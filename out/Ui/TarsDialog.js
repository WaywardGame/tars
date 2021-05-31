var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "game/item/IItem", "mod/Mod", "ui/component/Button", "ui/component/CheckButton", "ui/component/ChoiceList", "ui/component/Divider", "ui/component/dropdown/ItemDropdown", "ui/component/LabelledRow", "ui/screen/screens/game/component/Dialog", "ui/screen/screens/game/Dialogs", "utilities/enum/Enums", "utilities/math/Vector2", "../ITars", "../mode/modes/AcquireItem"], function (require, exports, IItem_1, Mod_1, Button_1, CheckButton_1, ChoiceList_1, Divider_1, ItemDropdown_1, LabelledRow_1, Dialog_1, Dialogs_1, Enums_1, Vector2_1, ITars_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TarsDialog extends Dialog_1.default {
        constructor(id) {
            super(id);
            this.registerHookHost("TarsDialog");
            this.labelStatus = new LabelledRow_1.LabelledRow()
                .setLabel(label => label.setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogLabelStatus).addArgs(this.TARS.getStatus)))
                .appendTo(this.body);
            this.buttonEnable = new CheckButton_1.CheckButton()
                .setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogButtonEnable))
                .setRefreshMethod(() => this.TARS.isEnabled())
                .event.subscribe("willToggle", (_, checked) => {
                if (this.TARS.isEnabled() !== checked) {
                    this.TARS.toggle();
                }
                return true;
            })
                .appendTo(this.body);
            new Divider_1.default().appendTo(this.body);
            const modes = Enums_1.default.values(ITars_1.TarsMode).filter(modes => modes !== ITars_1.TarsMode.Manual);
            this.choiceListMode = new ChoiceList_1.default()
                .setCanChooseNone()
                .setChoices(...modes.map(mode => new ChoiceList_1.Choice(mode)
                .setText(this.TARS.getTranslation(`DialogMode${ITars_1.TarsMode[mode]}`))
                .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(`DialogMode${ITars_1.TarsMode[mode]}Tooltip`))))))
                .setRefreshMethod(list => list.choices(choice => choice.id === this.TARS.saveData.options.mode).first())
                .event.subscribe("choose", (_, choice) => {
                if (choice !== undefined) {
                    this.TARS.updateOptions({ mode: choice.id });
                }
            })
                .appendTo(this.body);
            new Divider_1.default().appendTo(this.body);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogLabelItem)))
                .append(this.dropdownItemType = new ItemDropdown_1.default(IItem_1.ItemType.Branch))
                .appendTo(this.body);
            new Button_1.default()
                .setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogButtonAquireItem))
                .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogButtonAquireItemTooltip))))
                .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new AcquireItem_1.AcquireItemMode(this.dropdownItemType.selection));
                return true;
            })
                .appendTo(this.body);
            new Divider_1.default().appendTo(this.body);
            this.buttonStayHealthy = new CheckButton_1.CheckButton()
                .setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogButtonStayHealthy))
                .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogButtonStayHealthyTooltip))))
                .setRefreshMethod(() => this.TARS.saveData.options.stayHealthy)
                .event.subscribe("willToggle", (_, checked) => {
                this.TARS.updateOptions({ stayHealthy: checked });
                return true;
            })
                .appendTo(this.body);
            this.buttonExploreIslands = new CheckButton_1.CheckButton()
                .setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogButtonExploreIslands))
                .setTooltip(tooltip => tooltip.addText(text => text.setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogButtonExploreIslandsTooltip))))
                .setRefreshMethod(() => this.TARS.saveData.options.exploreIslands)
                .event.subscribe("willToggle", (_, checked) => {
                this.TARS.updateOptions({ exploreIslands: checked });
                return true;
            })
                .appendTo(this.body);
            const events = this.TARS.event.until(this, "close");
            events.subscribe("enableChange", this.refresh);
            events.subscribe("optionsChange", this.refresh);
            events.subscribe("statusChange", (_, status) => {
                this.labelStatus.setLabel(label => label.setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogLabelStatus).addArgs(status)));
            });
        }
        getName() {
            return this.TARS.getTranslation(ITars_1.TarsTranslation.DialogTitleMain);
        }
        refresh() {
            this.buttonEnable.refresh();
            this.choiceListMode.refresh();
            this.buttonStayHealthy.refresh();
            this.buttonExploreIslands.refresh();
            const isManual = this.TARS.saveData.options.mode === ITars_1.TarsMode.Manual;
            this.choiceListMode.setDisabled(isManual);
        }
    }
    TarsDialog.description = {
        minSize: new Vector2_1.default(15, 21),
        size: new Vector2_1.default(15, 70),
        maxSize: new Vector2_1.default(20, 70),
        edges: [
            [Dialogs_1.Edge.Left, 25],
            [Dialogs_1.Edge.Bottom, 33],
        ],
    };
    __decorate([
        Mod_1.default.instance(ITars_1.TARS_ID)
    ], TarsDialog.prototype, "TARS", void 0);
    __decorate([
        Override
    ], TarsDialog.prototype, "getName", null);
    __decorate([
        Bound
    ], TarsDialog.prototype, "refresh", null);
    exports.default = TarsDialog;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc0RpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91aS9UYXJzRGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQWtCQSxNQUFxQixVQUFXLFNBQVEsZ0JBQU07UUFzQjdDLFlBQW1CLEVBQVk7WUFDOUIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRVYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXBDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSx5QkFBVyxFQUFFO2lCQUNsQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLHVCQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2lCQUMxSCxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXRCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSx5QkFBVyxFQUFFO2lCQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2lCQUNyRSxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2lCQUM3QyxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDN0MsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLE9BQU8sRUFBRTtvQkFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDbkI7Z0JBRUQsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDLENBQUM7aUJBQ0QsUUFBUSxD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