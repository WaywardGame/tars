import type Translation from "language/Translation";
import { CheckButton } from "ui/component/CheckButton";
import ChoiceList, { Choice } from "ui/component/ChoiceList";
import Divider from "ui/component/Divider";
import Enums from "utilities/enum/Enums";
import { Bound } from "utilities/Decorators";

import TarsPanel from "../components/TarsPanel";
import { TarsMode } from "../../core/ITars";
import { getTarsTranslation, TarsTranslation } from "../../ITarsMod";

export default class GeneralPanel extends TarsPanel {

    // private readonly labelStatus: LabelledRow;
    private readonly buttonEnable: CheckButton;
    private readonly choiceListMode: ChoiceList<Choice<TarsMode>, true>;

    constructor() {
        super();

        // this.labelStatus = new LabelledRow()
        //     .setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelStatus).addArgs(this.TARS.getStatus)))
        //     .appendTo(this);

        this.buttonEnable = new CheckButton()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonEnable))
            .setRefreshMethod(() => this.TarsMod.tarsInstance?.isEnabled() ?? false)
            .event.subscribe("willToggle", (_, checked) => {
                if (this.TarsMod.tarsInstance?.isEnabled() !== checked) {
                    this.TarsMod.tarsInstance?.toggle();
                }

                return true;
            })
            .appendTo(this);

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
                        .setTooltip(tooltip => tooltip.addText(text => text.setText(getTarsTranslation(`DialogMode${TarsMode[mode]}Tooltip`))))
                }

                return choice;
            }))
            .setRefreshMethod(list => list.choices(choice => choice.id === this.TarsMod.saveData.options.mode).first())
            .event.subscribe("choose", (_, choice) => {
                const mode = choice?.id;
                if (mode !== undefined && mode !== this.TarsMod.saveData.options.mode) {
                    this.TarsMod.tarsInstance?.updateOptions({ mode });
                }
            })
            .appendTo(this);
    }

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelGeneral;
    }

    protected onSwitchTo() {
        const events = this.TarsMod.event.until(this, "switchAway", "remove");
        events.subscribe("enableChange", this.refresh);
        events.subscribe("optionsChange", this.refresh);
    }

    @Bound
    protected refresh() {
        this.buttonEnable.refresh();
        this.choiceListMode.refresh();

        const isManual = this.TarsMod.saveData.options.mode === TarsMode.Manual;
        this.choiceListMode.setDisabled(isManual);
    }
}
