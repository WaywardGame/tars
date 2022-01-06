import type Translation from "language/Translation";
import { ItemType } from "game/item/IItem";
import Button from "ui/component/Button";
import ItemDropdown from "ui/component/dropdown/ItemDropdown";
import DoodadDropdown from "ui/component/dropdown/DoodadDropdown";
import { LabelledRow } from "ui/component/LabelledRow";
import Divider from "ui/component/Divider";
import { DoodadType } from "game/doodad/IDoodad";
import { Bound } from "utilities/Decorators";

import { AcquireItemMode } from "../../modes/AcquireItem";
import TarsPanel from "../components/TarsPanel";
import { BuildDoodadMode } from "../../modes/BuildDoodad";
import { getTarsTranslation, TarsTranslation, TarsUiSaveDataKey } from "../../ITarsMod";

export default class TasksPanel extends TarsPanel {

    private readonly dropdownItemType: ItemDropdown<string>;
    private readonly dropdownDoodadType: DoodadDropdown<string>;

    constructor() {
        super();

        new LabelledRow()
            .classes.add("dropdown-label")
            .setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelItem)))
            .append(this.dropdownItemType = new ItemDropdown(this.TarsMod.saveData.ui[TarsUiSaveDataKey.AcquireItemDropdown] ?? ItemType.Branch)
                .event.subscribe("selection", async (_, selection) => {
                    this.TarsMod.saveData.ui[TarsUiSaveDataKey.AcquireItemDropdown] = selection;
                }))
            .appendTo(this);

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonAquireItem))
            .setTooltip(tooltip => tooltip.addText(text => text.setText(getTarsTranslation(TarsTranslation.DialogButtonAquireItemTooltip))))
            .event.subscribe("activate", async () => {
                await this.TarsMod.tarsInstance?.activateManualMode(new AcquireItemMode(this.dropdownItemType.selection as ItemType));
                return true;
            })
            .appendTo(this);

        new Divider().appendTo(this);

        new LabelledRow()
            .classes.add("dropdown-label")
            .setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelDoodad)))
            .append(this.dropdownDoodadType = new DoodadDropdown(this.TarsMod.saveData.ui[TarsUiSaveDataKey.BuildDoodadDropdown] ?? DoodadType.StoneCampfire)
                .event.subscribe("selection", async (_, selection) => {
                    this.TarsMod.saveData.ui[TarsUiSaveDataKey.BuildDoodadDropdown] = selection;
                }))
            .appendTo(this);

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonBuildDoodad))
            .setTooltip(tooltip => tooltip.addText(text => text.setText(getTarsTranslation(TarsTranslation.DialogButtonBuildDoodadTooltip))))
            .event.subscribe("activate", async () => {
                await this.TarsMod.tarsInstance?.activateManualMode(new BuildDoodadMode(this.dropdownDoodadType.selection as DoodadType));
                return true;
            })
            .appendTo(this);
    }

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelTasks;
    }

    protected onSwitchTo() {
    }

    @Bound
    protected refresh() {
    }
}
