var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "mod/Mod", "ui/component/CheckButton", "ui/component/ChoiceList", "ui/component/LabelledRow", "ui/screen/screens/game/component/Dialog", "ui/screen/screens/game/Dialogs", "ui/screen/screens/menu/component/Spacer", "utilities/enum/Enums", "utilities/math/Vector2", "../ITars"], function (require, exports, Mod_1, CheckButton_1, ChoiceList_1, LabelledRow_1, Dialog_1, Dialogs_1, Spacer_1, Enums_1, Vector2_1, ITars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TarsDialog extends Dialog_1.default {
        constructor(id) {
            super(id);
            this.registerHookHost("TarsDialog");
            this.statusLabel = new LabelledRow_1.LabelledRow()
                .setLabel(label => label.setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogLabelStatus).addArgs(this.TARS.getStatus)))
                .appendTo(this.body);
            this.enableButton = new CheckButton_1.CheckButton()
                .setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogButtonEnable))
                .setRefreshMethod(() => this.TARS.isEnabled())
                .event.subscribe("willToggle", (_, checked) => {
                if (this.TARS.isEnabled() !== checked) {
                    this.TARS.toggle();
                }
                return true;
            })
                .appendTo(this.body);
            new Spacer_1.default().appendTo(this.body);
            const modes = Enums_1.default.values(ITars_1.TarsMode);
            this.modeChoiceList = new ChoiceList_1.default()
                .setChoices(...modes.map(mode => new ChoiceList_1.Choice(mode)
                .setText(this.TARS.getTranslation(`DialogMode${ITars_1.TarsMode[mode]}`))))
                .setRefreshMethod(list => list.choices(choice => choice.id === this.TARS.getMode()).first())
                .event.subscribe("choose", (_, choice) => {
                this.TARS.setMode(choice.id);
            })
                .appendTo(this.body);
            const events = this.TARS.event.until(this, "close");
            events.subscribe("enableChange", this.refresh);
            events.subscribe("statusChange", (_, status) => {
                this.statusLabel.setLabel(label => label.setText(this.TARS.getTranslation(ITars_1.TarsTranslation.DialogLabelStatus).addArgs(status)));
            });
        }
        getName() {
            return this.TARS.getTranslation(ITars_1.TarsTranslation.DialogTitleMain);
        }
        refresh() {
            this.enableButton.refresh();
            this.modeChoiceList.refresh();
        }
    }
    TarsDialog.description = {
        minSize: new Vector2_1.default(15, 21),
        size: new Vector2_1.default(15, 21),
        maxSize: new Vector2_1.default(20, 35),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc0RpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91aS9UYXJzRGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQWNBLE1BQXFCLFVBQVcsU0FBUSxnQkFBTTtRQW1CN0MsWUFBbUIsRUFBWTtZQUM5QixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFVixJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFcEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLHlCQUFXLEVBQUU7aUJBQ2xDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7aUJBQzFILFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLHlCQUFXLEVBQUU7aUJBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBZSxDQUFDLGtCQUFrQixDQUFDLENBQUM7aUJBQ3JFLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7aUJBQzdDLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUM3QyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssT0FBTyxFQUFFO29CQUN0QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2lCQUNuQjtnQkFFRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUMsQ0FBQztpQkFDRCxRQUFRLENB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