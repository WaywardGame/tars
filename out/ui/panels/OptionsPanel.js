var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "ui/component/CheckButton", "ui/component/Divider", "ui/component/RangeRow", "ui/component/Text", "ui/component/IComponent", "utilities/Decorators", "../components/TarsPanel", "../../ITarsMod", "ui/component/ChoiceList"], function (require, exports, CheckButton_1, Divider_1, RangeRow_1, Text_1, IComponent_1, Decorators_1, TarsPanel_1, ITarsMod_1, ChoiceList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OptionsPanel extends TarsPanel_1.default {
        constructor(tarsInstance, options) {
            super(tarsInstance);
            this.refreshableComponents = [];
            for (const uiOption of options) {
                if (uiOption === undefined) {
                    new Divider_1.default()
                        .appendTo(this);
                    continue;
                }
                if (typeof (uiOption) === "number") {
                    new Text_1.Heading()
                        .setText((0, ITarsMod_1.getTarsTranslation)(uiOption))
                        .appendTo(this);
                    continue;
                }
                let optionComponent;
                const isDisabled = uiOption.isDisabled?.() ?? false;
                switch (uiOption.type) {
                    case ITarsMod_1.TarsOptionSectionType.Checkbox:
                        optionComponent = new CheckButton_1.CheckButton()
                            .setText((0, ITarsMod_1.getTarsTranslation)(uiOption.title))
                            .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(uiOption.tooltip))))
                            .setRefreshMethod(() => this.tarsInstance.saveData.options[uiOption.option])
                            .event.subscribe("willToggle", (_, checked) => {
                            this.tarsInstance.updateOptions({ [uiOption.option]: checked });
                            return true;
                        })
                            .setDisabled(isDisabled);
                        break;
                    case ITarsMod_1.TarsOptionSectionType.Slider:
                        const slider = uiOption.slider;
                        const range = new RangeRow_1.RangeRow()
                            .setLabel(label => label
                            .setText((0, ITarsMod_1.getTarsTranslation)(uiOption.title)))
                            .setTooltip(tooltip => tooltip
                            .addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(uiOption.tooltip)))
                            .setLocation(IComponent_1.TooltipLocation.TopRight))
                            .setDisplayValue(() => (0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabel).get(this.tarsInstance.saveData.options[uiOption.option]))
                            .event.subscribe("change", (_, value) => {
                            this.tarsInstance.updateOptions({ [uiOption.option]: value });
                        })
                            .setDisabled(isDisabled);
                        range.editRange(range => range
                            .setMin(typeof (slider.min) === "number" ? slider.min : slider.min(this.tarsInstance.getContext()))
                            .setMax(typeof (slider.max) === "number" ? slider.max : slider.max(this.tarsInstance.getContext()))
                            .setRefreshMethod(() => {
                            range.setMin(typeof (slider.min) === "number" ? slider.min : slider.min(this.tarsInstance.getContext()));
                            range.setMax(typeof (slider.max) === "number" ? slider.max : slider.max(this.tarsInstance.getContext()));
                            return this.tarsInstance.saveData.options[uiOption.option];
                        }));
                        optionComponent = range;
                        break;
                    case ITarsMod_1.TarsOptionSectionType.Choice:
                        optionComponent = new ChoiceList_1.default()
                            .setChoices(Array.from(uiOption.choices).map(([textTranslation, tooltipTranslation, value]) => new ChoiceList_1.Choice(value)
                            .setText((0, ITarsMod_1.getTarsTranslation)(textTranslation))
                            .setTooltip(tooltip => tooltip
                            .addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(tooltipTranslation)))
                            .setLocation(IComponent_1.TooltipLocation.TopRight))))
                            .setRefreshMethod(list => list.choices(choice => choice.id === this.tarsInstance.saveData.options[uiOption.option]).first())
                            .event.subscribe("choose", (_, choice) => {
                            this.tarsInstance.updateOptions({ [uiOption.option]: choice.id });
                        })
                            .setDisabled(isDisabled);
                        break;
                }
                optionComponent.appendTo(this);
                this.refreshableComponents.push(optionComponent);
            }
        }
        onSwitchTo() {
            const events = this.tarsInstance.event.until(this, "switchAway", "remove");
            events.subscribe("optionsChange", this.refresh);
        }
        refresh() {
            for (const component of this.refreshableComponents) {
                component.refresh();
            }
        }
    }
    __decorate([
        Decorators_1.Bound
    ], OptionsPanel.prototype, "refresh", null);
    exports.default = OptionsPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9PcHRpb25zUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBZUEsTUFBOEIsWUFBYSxTQUFRLG1CQUFTO1FBSXhELFlBQVksWUFBa0IsRUFBRSxPQUErRDtZQUMzRixLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFIUCwwQkFBcUIsR0FBbUIsRUFBRSxDQUFDO1lBS3hELEtBQUssTUFBTSxRQUFRLElBQUksT0FBTyxFQUFFO2dCQUM1QixJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7b0JBQ3hCLElBQUksaUJBQU8sRUFBRTt5QkFDUixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BCLFNBQVM7aUJBQ1o7Z0JBRUQsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssUUFBUSxFQUFFO29CQUNoQyxJQUFJLGNBQU8sRUFBRTt5QkFDUixPQUFPLENBQUMsSUFBQSw2QkFBa0IsRUFBQyxRQUFRLENBQUMsQ0FBQzt5QkFDckMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNwQixTQUFTO2lCQUNaO2dCQUVELElBQUksZUFBeUMsQ0FBQztnQkFFOUMsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsRUFBRSxFQUFFLElBQUksS0FBSyxDQUFDO2dCQUVwRCxRQUFRLFFBQVEsQ0FBQyxJQUFJLEVBQUU7b0JBQ25CLEtBQUssZ0NBQXFCLENBQUMsUUFBUTt3QkFDL0IsZUFBZSxHQUFHLElBQUkseUJBQVcsRUFBRTs2QkFDOUIsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDOzZCQUMzQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFBLDZC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