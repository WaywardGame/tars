var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "ui/component/CheckButton", "ui/component/Divider", "ui/component/RangeRow", "ui/component/Text", "ui/component/IComponent", "utilities/Decorators", "../components/TarsPanel", "../../ITarsMod"], function (require, exports, CheckButton_1, Divider_1, RangeRow_1, Text_1, IComponent_1, Decorators_1, TarsPanel_1, ITarsMod_1) {
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
                const slider = uiOption.slider;
                if (slider) {
                    optionComponent = new RangeRow_1.RangeRow()
                        .setLabel(label => label
                        .setText((0, ITarsMod_1.getTarsTranslation)(uiOption.title)))
                        .setTooltip(tooltip => tooltip
                        .addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(uiOption.tooltip)))
                        .setLocation(IComponent_1.TooltipLocation.TopRight))
                        .editRange(range => range
                        .setMin(typeof (slider.min) === "number" ? slider.min : slider.min(this.TarsMod.tarsInstance.getContext()))
                        .setMax(typeof (slider.max) === "number" ? slider.max : slider.max(this.TarsMod.tarsInstance.getContext()))
                        .setRefreshMethod(() => this.TarsMod.saveData.options[uiOption.option]))
                        .setDisplayValue(() => (0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogRangeLabel)
                        .get(this.TarsMod.saveData.options[uiOption.option]))
                        .event.subscribe("change", (_, value) => {
                        this.TarsMod.tarsInstance?.updateOptions({ [uiOption.option]: value });
                    })
                        .setDisabled(isDisabled);
                }
                else {
                    optionComponent = new CheckButton_1.CheckButton()
                        .setText((0, ITarsMod_1.getTarsTranslation)(uiOption.title))
                        .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(uiOption.tooltip))))
                        .setRefreshMethod(() => this.TarsMod.saveData.options[uiOption.option])
                        .event.subscribe("willToggle", (_, checked) => {
                        this.TarsMod.tarsInstance?.updateOptions({ [uiOption.option]: checked });
                        return true;
                    })
                        .setDisabled(isDisabled);
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
            for (const button of this.refreshableComponents) {
                button.refresh();
            }
        }
    }
    __decorate([
        Decorators_1.Bound
    ], OptionsPanel.prototype, "refresh", null);
    exports.default = OptionsPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9PcHRpb25zUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBYUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBSS9DO1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFISywwQkFBcUIsR0FBbUIsRUFBRSxDQUFDO1lBS3hELEtBQUssTUFBTSxRQUFRLElBQUksZ0NBQXFCLEVBQUU7Z0JBQzFDLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtvQkFDeEIsSUFBSSxpQkFBTyxFQUFFO3lCQUNSLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEIsU0FBUztpQkFDWjtnQkFFRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxRQUFRLEVBQUU7b0JBQ2hDLElBQUksY0FBTyxFQUFFO3lCQUNSLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLFFBQVEsQ0FBQyxDQUFDO3lCQUNyQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BCLFNBQVM7aUJBQ1o7Z0JBRUQsSUFBSSxlQUF5QyxDQUFDO2dCQUU5QyxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxLQUFLLENBQUM7Z0JBRXBELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQy9CLElBQUksTUFBTSxFQUFFO29CQUNSLGVBQWUsR0FBRyxJQUFJLG1CQUFRLEVBQUU7eUJBQzNCLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUs7eUJBQ25CLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUMvQzt5QkFDQSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPO3lCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENB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