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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9PcHRpb25zUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBYUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBSS9DO1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFISywwQkFBcUIsR0FBbUIsRUFBRSxDQUFDO1lBS3hELEtBQUssTUFBTSxRQUFRLElBQUksZ0NBQXFCLEVBQUU7Z0JBQzFDLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtvQkFDeEIsSUFBSSxpQkFBTyxFQUFFO3lCQUNSLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEIsU0FBUztpQkFDWjtnQkFFRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxRQUFRLEVBQUU7b0JBQ2hDLElBQUksY0FBTyxFQUFFO3lCQUNSLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLFFBQVEsQ0FBQyxDQUFDO3lCQUNyQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BCLFNBQVM7aUJBQ1o7Z0JBRUQsSUFBSSxlQUF5QyxDQUFDO2dCQUU5QyxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxLQUFLLENBQUM7Z0JBRXBELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQy9CLElBQUksTUFBTSxFQUFFO29CQUNSLE1BQU0sS0FBSyxHQUFHLElBQUksbUJBQVEsRUFBRTt5QkFDdkIsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSzt5QkFDbkIsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQy9DO3lCQUNBLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU87eUJBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElB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