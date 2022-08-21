import type Translation from "language/Translation";
import Button from "ui/component/Button";
import Divider from "ui/component/Divider";
import { Bound } from "utilities/Decorators";
import { LabeledButtonRow } from "ui/component/LabeledButtonRow";
import Component from "ui/component/Component";
import Prompts from "game/meta/prompt/Prompts";
import { promptDescriptionFactory } from "game/meta/prompt/PromptDescriptionFactory";
import { PromptPriority } from "game/meta/prompt/IPrompt";

import TarsPanel from "../components/TarsPanel";
import { getTarsTranslation, TarsTranslation, TARS_ID } from "../../ITarsMod";
import Tars from "../../core/Tars";
import Mod from "mod/Mod";
import TarsMod from "../../TarsMod";
import TarsNPC from "../../npc/TarsNPC";
import TarsDialog from "../TarsDialog";

export default class NPCsPanel extends TarsPanel {

    @Mod.instance<TarsMod>(TARS_ID)
    public readonly TarsMod: TarsMod;

    private readonly rows: Component;

    constructor(tarsInstance: Tars) {
        super(tarsInstance);

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonSpawnNPC))
            .setTooltip(tooltip => tooltip.addText(text => text.setText(getTarsTranslation(TarsTranslation.DialogButtonSpawnNPCTooltip))))
            .event.subscribe("activate", async () => {
                this.TarsMod.spawnNpc();
                return true;
            })
            .appendTo(this);

        new Divider().appendTo(this);

        this.rows = new Component()
            .setStyle("display", "grid")
            .setStyle("row-gap", "5px")
            .setStyle("column-count", "1")
            .appendTo(this);
    }

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelNPCs;
    }

    protected onSwitchTo() {
        for (const island of game.islands.active) {
            const events = island.npcs.event.until(this, "switchAway", "remove");
            events.subscribe("spawn", this.refresh);
            events.subscribe("remove", this.refresh);
        }
    }

    @Bound
    protected async refresh() {
        // ensure the refresh occurs after the npc is removed from the manager
        await this.sleep(10);

        this.rows.dump();

        const nonPlayerHumans = game.getNonPlayerHumans();
        for (const human of nonPlayerHumans) {
            if (!(human instanceof TarsNPC)) {
                continue;
            }

            const tarsInstance = human.tarsInstance;
            if (tarsInstance === undefined) {
                continue;
            }

            const blockRow = new LabeledButtonRow()
                .setLabel(label => label.setText(human.getName()))
                .addButton(button => button
                    .classes.add("button-gear")
                    .setTooltip(tooltip => tooltip
                        .addHeading(heading => heading
                            .setText(getTarsTranslation(TarsTranslation.DialogButtonConfigurationTooltip))))
                    .event.subscribe("activate", () => {
                        gameScreen?.dialogs.open<TarsDialog>(this.TarsMod.dialogMain, tarsInstance.getDialogSubId())?.initialize(tarsInstance);
                    }))
                .addButton(button => button
                    .classes.add("button-delete")
                    .setTooltip(tooltip => tooltip
                        .addHeading(heading => heading
                            .setText(getTarsTranslation(TarsTranslation.DialogButtonDeleteTooltip))))
                    .event.subscribe("activate", async () => {
                        if (!await Prompts.queue(
                            promptDescriptionFactory
                                .priority(PromptPriority.Default)
                                .confirm<[npcName: Translation]>(this.TarsMod.promptDeleteConfirmation),
                            human.getName())) {
                            return;
                        }

                        localIsland.npcs.remove(human);
                    }))
                .appendTo(this.rows);

            human.event.until(blockRow.label, "remove")
                .subscribe("renamed", () => {
                    blockRow.label.setText(human.getName());
                });
        }
    }
}
