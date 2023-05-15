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

import Rename from "game/entity/action/actions/Rename";
import { promptGameRenameGeneric } from "game/meta/prompt/PromptDescriptions";
import type Translation from "language/Translation";
import { CheckButton } from "ui/component/CheckButton";
import ChoiceList, { Choice } from "ui/component/ChoiceList";
import Divider from "ui/component/Divider";
import { Bound } from "utilities/Decorators";
import Enums from "utilities/enum/Enums";

import Prompts from "game/meta/prompt/Prompts";
import { TextContext } from "language/ITranslation";
import Button from "ui/component/Button";
import { TarsMode } from "../../core/ITars";
import Tars from "../../core/Tars";
import { getTarsTranslation, TarsTranslation } from "../../ITarsMod";
import TarsPanel from "../components/TarsPanel";

export default class GeneralPanel extends TarsPanel {

    private readonly buttonEnable: CheckButton;
    private readonly choiceListMode: ChoiceList<Choice<TarsMode>, true>;

    constructor(tarsInstance: Tars) {
        super(tarsInstance);

        this.buttonEnable = new CheckButton()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonEnable))
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
            new Divider().appendTo(this);

            new Button()
                .setText(getTarsTranslation(TarsTranslation.DialogButtonRename))
                .event.subscribe("activate", () => {
                    const placeholder = npc.getName().inContext(TextContext.Title);

                    Prompts.queue(promptGameRenameGeneric, placeholder, npc.getName().getString())
                        .then(newName => {
                            if (newName === undefined) {
                                return;
                            }

                            if (newName === (placeholder?.getString() || "")) {
                                newName = placeholder.getString();
                            }

                            Rename.execute(localPlayer, npc, newName);
                        });

                    return true;
                })
                .appendTo(this);
        }

        new Divider().appendTo(this);

        this.choiceListMode = new ChoiceList<Choice<TarsMode>, true>()
            .setChoices(...Enums.values(TarsMode).map(mode => {
                const choice = new Choice(mode);
                if (mode === TarsMode.Manual) {
                    // not a user selectable mode
                    choice.hide();

                } else {
                    choice
                        .setText(getTarsTranslation(`DialogMode${TarsMode[mode]}`))
                        .setTooltip(tooltip => tooltip.setText(getTarsTranslation(`DialogMode${TarsMode[mode]}Tooltip`)))
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

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelGeneral;
    }

    protected onSwitchTo() {
        const events = this.tarsInstance.event.until(this, "switchAway", "remove");
        events.subscribe("enableChange", this.refresh);
        events.subscribe("optionsChange", this.refresh);
    }

    @Bound
    protected refresh() {
        this.buttonEnable.refresh(false);
        this.choiceListMode.refresh();

        const isManual = this.tarsInstance.saveData.options.mode === TarsMode.Manual;
        this.choiceListMode.setDisabled(isManual);
    }
}
