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
define(["require", "exports", "game/entity/action/actions/Rename", "game/meta/prompt/PromptDescriptions", "ui/component/CheckButton", "ui/component/ChoiceList", "ui/component/Divider", "utilities/Decorators", "utilities/enum/Enums", "game/meta/prompt/Prompts", "language/ITranslation", "ui/component/Button", "../../core/ITars", "../../ITarsMod", "../components/TarsPanel"], function (require, exports, Rename_1, PromptDescriptions_1, CheckButton_1, ChoiceList_1, Divider_1, Decorators_1, Enums_1, Prompts_1, ITranslation_1, Button_1, ITars_1, ITarsMod_1, TarsPanel_1) {
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
    __decorate([
        Decorators_1.Bound
    ], GeneralPanel.prototype, "refresh", null);
    exports.default = GeneralPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VuZXJhbFBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9HZW5lcmFsUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7Ozs7Ozs7O0lBbUJILE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUsvQyxZQUFZLFlBQWtCO1lBQzFCLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVwQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUkseUJBQVcsRUFBRTtpQkFDaEMsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2lCQUMvRCxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxJQUFJLEtBQUssQ0FBQztpQkFDOUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUU7Z0JBQzFDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxLQUFLLE9BQU8sRUFBRTtvQkFDNUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDM0IsT0FBTyxJQUFJLENBQUM7aUJBQ2Y7Z0JBRUQsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQyxDQUFDO2lCQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVwQixNQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBQy9CLElBQUksR0FBRyxFQUFFO2dCQUNMLElBQUksaUJBQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFN0IsSUFBSSxnQkFBTSxFQUFFO3FCQUNQLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMsa0JBQWtC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