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
        constructor() {
            super();
            this.refreshableComponents = [];
            for (const uiOption of ITarsMod_1.uiConfigurableOptions) {
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
                            .setRefreshMethod(() => this.TarsMod.saveData.options[uiOption.option])
                            .event.subscribe("willToggle", (_, checked) => {
                            this.TarsMod.tarsInstance?.updateOptions({ [uiOption.option]: checked });
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
                            .setDisplayValue(() => (0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogRangeLabel).get(this.TarsMod.saveData.options[uiOption.option]))
                            .event.subscribe("change", (_, value) => {
                            this.TarsMod.tarsInstance?.updateOptions({ [uiOption.option]: value });
                        })
                            .setDisabled(isDisabled);
                        range.editRange(range => range
                            .setMin(typeof (slider.min) === "number" ? slider.min : this.TarsMod.tarsInstance ? slider.min(this.TarsMod.tarsInstance.getContext()) : 0)
                            .setMax(typeof (slider.max) === "number" ? slider.max : this.TarsMod.tarsInstance ? slider.max(this.TarsMod.tarsInstance.getContext()) : 0)
                            .setRefreshMethod(() => {
                            range.setMin(typeof (slider.min) === "number" ? slider.min : this.TarsMod.tarsInstance ? slider.min(this.TarsMod.tarsInstance.getContext()) : 0);
                            range.setMax(typeof (slider.max) === "number" ? slider.max : this.TarsMod.tarsInstance ? slider.max(this.TarsMod.tarsInstance.getContext()) : 0);
                            return this.TarsMod.saveData.options[uiOption.option];
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
                            .setRefreshMethod(list => list.choices(choice => choice.id === this.TarsMod.saveData.options.useProtectedItems).first())
                            .event.subscribe("choose", (_, choice) => {
                            this.TarsMod.tarsInstance?.updateOptions({ [uiOption.option]: choice.id });
                        })
                            .setDisabled(isDisabled);
                        break;
                }
                optionComponent.appendTo(this);
                this.refreshableComponents.push(optionComponent);
            }
        }
        getTranslation() {
            return ITarsMod_1.TarsTranslation.DialogPanelOptions;
        }
        onSwitchTo() {
            const events = this.TarsMod.event.until(this, "switchAway", "remove");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9PcHRpb25zUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBY0EsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBSS9DO1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFISywwQkFBcUIsR0FBbUIsRUFBRSxDQUFDO1lBS3hELEtBQUssTUFBTSxRQUFRLElBQUksZ0NBQXFCLEVBQUU7Z0JBQzFDLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtvQkFDeEIsSUFBSSxpQkFBTyxFQUFFO3lCQUNSLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEIsU0FBUztpQkFDWjtnQkFFRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxRQUFRLEVBQUU7b0JBQ2hDLElBQUksY0FBTyxFQUFFO3lCQUNSLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLFFBQVEsQ0FBQyxDQUFDO3lCQUNyQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BCLFNBQVM7aUJBQ1o7Z0JBRUQsSUFBSSxlQUF5QyxDQUFDO2dCQUU5QyxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxLQUFLLENBQUM7Z0JBRXBELFFBQVEsUUFBUSxDQUFDLElBQUksRUFBRTtvQkFDbkIsS0FBSyxnQ0FBcUIsQ0FBQyxRQUFRO3dCQUMvQixlQUFlLEdBQUcsSUFBSSx5QkFBVyxFQUFFOzZCQUM5QixPQUFPLENBQUMsSUFBQSw2QkFBa0IsRUFBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7NkJBQzNDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxD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