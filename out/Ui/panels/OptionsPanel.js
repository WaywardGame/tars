var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "ui/component/CheckButton", "ui/component/Divider", "ui/component/RangeRow", "ui/component/Text", "ui/component/IComponent", "../../ITars", "../components/TarsPanel"], function (require, exports, CheckButton_1, Divider_1, RangeRow_1, Text_1, IComponent_1, ITars_1, TarsPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OptionsPanel extends TarsPanel_1.default {
        constructor() {
            var _a, _b;
            super();
            this.refreshableComponents = [];
            for (const uiOption of ITars_1.uiConfigurableOptions) {
                if (uiOption === undefined) {
                    new Divider_1.default()
                        .appendTo(this);
                    continue;
                }
                if (typeof (uiOption) === "number") {
                    new Text_1.Heading()
                        .setText(ITars_1.getTarsTranslation(uiOption))
                        .appendTo(this);
                    continue;
                }
                let optionComponent;
                const isDisabled = (_b = (_a = uiOption.isDisabled) === null || _a === void 0 ? void 0 : _a.call(uiOption)) !== null && _b !== void 0 ? _b : false;
                const slider = uiOption.slider;
                if (slider) {
                    optionComponent = new RangeRow_1.RangeRow()
                        .setLabel(label => label
                        .setText(ITars_1.getTarsTranslation(uiOption.title)))
                        .setTooltip(tooltip => tooltip
                        .addText(text => text.setText(ITars_1.getTarsTranslation(uiOption.tooltip)))
                        .setLocation(IComponent_1.TooltipLocation.TopRight))
                        .editRange(range => range
                        .setMin(typeof (slider.min) === "number" ? slider.min : slider.min(this.TARS.getContext()))
                        .setMax(typeof (slider.max) === "number" ? slider.max : slider.max(this.TARS.getContext()))
                        .setRefreshMethod(() => this.TARS.saveData.options[uiOption.option]))
                        .setDisplayValue(() => ITars_1.getTarsTranslation(ITars_1.TarsTranslation.DialogRangeLabel)
                        .get(this.TARS.saveData.options[uiOption.option]))
                        .event.subscribe("change", (_, value) => {
                        this.TARS.updateOptions({ [uiOption.option]: value });
                    })
                        .setDisabled(isDisabled);
                }
                else {
                    optionComponent = new CheckButton_1.CheckButton()
                        .setText(ITars_1.getTarsTranslation(uiOption.title))
                        .setTooltip(tooltip => tooltip.addText(text => text.setText(ITars_1.getTarsTranslation(uiOption.tooltip))))
                        .setRefreshMethod(() => this.TARS.saveData.options[uiOption.option])
                        .event.subscribe("willToggle", (_, checked) => {
                        this.TARS.updateOptions({ [uiOption.option]: checked });
                        return true;
                    })
                        .setDisabled(isDisabled);
                }
                optionComponent.appendTo(this);
                this.refreshableComponents.push(optionComponent);
            }
        }
        getTranslation() {
            return ITars_1.TarsTranslation.DialogPanelOptions;
        }
        onSwitchTo() {
            const events = this.TARS.event.until(this, "switchAway", "remove");
            events.subscribe("optionsChange", this.refresh);
        }
        refresh() {
            for (const button of this.refreshableComponents) {
                button.refresh();
            }
        }
    }
    __decorate([
        Bound
    ], OptionsPanel.prototype, "refresh", null);
    exports.default = OptionsPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9PcHRpb25zUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBWUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBSS9DOztZQUNJLEtBQUssRUFBRSxDQUFDO1lBSEssMEJBQXFCLEdBQW1CLEVBQUUsQ0FBQztZQUt4RCxLQUFLLE1BQU0sUUFBUSxJQUFJLDZCQUFxQixFQUFFO2dCQUMxQyxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7b0JBQ3hCLElBQUksaUJBQU8sRUFBRTt5QkFDUixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BCLFNBQVM7aUJBQ1o7Z0JBRUQsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssUUFBUSxFQUFFO29CQUNoQyxJQUFJLGNBQU8sRUFBRTt5QkFDUixPQUFPLENBQUMsMEJBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7eUJBQ3JDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEIsU0FBUztpQkFDWjtnQkFFRCxJQUFJLGVBQXlDLENBQUM7Z0JBRTlDLE1BQU0sVUFBVSxHQUFHLE1BQUEsTUFBQSxRQUFRLENBQUMsVUFBVSwrQ0FBbkIsUUFBUSxDQUFlLG1DQUFJLEtBQUssQ0FBQztnQkFFcEQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDL0IsSUFBSSxNQUFNLEVBQUU7b0JBQ1IsZUFBZSxHQUFHLElBQUksbUJBQVEsRUFBRTt5QkFDM0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSzt5QkFDbkIsT0FBTyxDQUFDLDBCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUMvQzt5QkFDQSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPO3lCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FB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