/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "@wayward/game/game/entity/action/actions/Rename", "@wayward/game/game/meta/prompt/PromptDescriptions", "@wayward/game/ui/component/CheckButton", "@wayward/game/ui/component/ChoiceList", "@wayward/game/ui/component/Divider", "@wayward/utilities/Decorators", "@wayward/game/utilities/enum/Enums", "@wayward/game/game/meta/prompt/Prompts", "@wayward/game/language/ITranslation", "@wayward/game/ui/component/Button", "../../core/ITars", "../../ITarsMod", "../components/TarsPanel"], function (require, exports, Rename_1, PromptDescriptions_1, CheckButton_1, ChoiceList_1, Divider_1, Decorators_1, Enums_1, Prompts_1, ITranslation_1, Button_1, ITars_1, ITarsMod_1, TarsPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GeneralPanel extends TarsPanel_1.default {
        constructor(tarsInstance) {
            super(tarsInstance);
            this.buttonEnable = new CheckButton_1.CheckButton()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonEnable))
                .setRefreshMethod(() => this.tarsInstance.isEnabled() ?? false)
                .event.subscribe("willToggle", (_, checked) => {
                if (this.tarsInstance.canToggle() && this.tarsInstance.isEnabled() !== checked) {
                    this.tarsInstance.toggle();
                    return true;
                }
                return false;
            })
                .appendTo(this);
            const npc = tarsInstance.asNPC;
            if (npc) {
                new Divider_1.default().appendTo(this);
                new Button_1.default()
                    .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonRename))
                    .event.subscribe("activate", () => {
                    const placeholder = npc.getName().inContext(ITranslation_1.TextContext.Title);
                    Prompts_1.default.queue(PromptDescriptions_1.promptGameRenameGeneric, placeholder, npc.getName().getString())
                        .then(newName => {
                        if (newName === undefined) {
                            return;
                        }
                        if (newName === (placeholder?.getString() || "")) {
                            newName = placeholder.getString();
                        }
                        Rename_1.default.execute(localPlayer, npc, newName);
                    });
                    return true;
                })
                    .appendTo(this);
            }
            new Divider_1.default().appendTo(this);
            this.choiceListMode = new ChoiceList_1.default()
                .setChoices(...Enums_1.default.values(ITars_1.TarsMode).map(mode => {
                const choice = new ChoiceList_1.Choice(mode);
                if (mode === ITars_1.TarsMode.Manual) {
                    choice.hide();
                }
                else {
                    choice
                        .setText((0, ITarsMod_1.getTarsTranslation)(`DialogMode${ITars_1.TarsMode[mode]}`))
                        .setTooltip(tooltip => tooltip.setText((0, ITarsMod_1.getTarsTranslation)(`DialogMode${ITars_1.TarsMode[mode]}Tooltip`)));
                }
                return choice;
            }))
                .setRefreshMethod(list => list.choices(choice => choice.id === this.tarsInstance.saveData.options.mode).first())
                .event.subscribe("choose", (_, choice) => {
                const mode = choice?.id;
                if (mode !== undefined && mode !== this.tarsInstance.saveData.options.mode) {
                    this.tarsInstance.updateOptions({ mode });
                }
            })
                .appendTo(this);
        }
        getTranslation() {
            return ITarsMod_1.TarsTranslation.DialogPanelGeneral;
        }
        onSwitchTo() {
            const events = this.tarsInstance.event.until(this, "switchAway", "remove");
            events.subscribe("enableChange", this.refresh);
            events.subscribe("optionsChange", this.refresh);
        }
        refresh() {
            this.buttonEnable.refresh(false);
            this.choiceListMode.refresh();
            const isManual = this.tarsInstance.saveData.options.mode === ITars_1.TarsMode.Manual;
            this.choiceListMode.setDisabled(isManual);
        }
    }
    exports.default = GeneralPanel;
    __decorate([
        Decorators_1.Bound
    ], GeneralPanel.prototype, "refresh", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VuZXJhbFBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9HZW5lcmFsUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7Ozs7Ozs7O0lBbUJILE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUtsRCxZQUFZLFlBQWtCO1lBQzdCLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVwQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUkseUJBQVcsRUFBRTtpQkFDbkMsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2lCQUMvRCxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxJQUFJLEtBQUssQ0FBQztpQkFDOUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUU7Z0JBQzdDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxLQUFLLE9BQU8sRUFBRSxDQUFDO29CQUNoRixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUMzQixPQUFPLElBQUksQ0FBQztnQkFDYixDQUFDO2dCQUVELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQyxDQUFDO2lCQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVqQixNQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBQy9CLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ1QsSUFBSSxpQkFBTyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUU3QixJQUFJLGdCQUFNLEVBQUU7cUJBQ1YsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJB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