import Rename from "@wayward/game/game/entity/action/actions/Rename";
import { promptGameRenameGeneric } from "@wayward/game/game/meta/prompt/PromptDescriptions";
import type Translation from "@wayward/game/language/Translation";
import { CheckButton } from "@wayward/game/ui/component/CheckButton";
import ChoiceList, { Choice } from "@wayward/game/ui/component/ChoiceList";
import Divider from "@wayward/game/ui/component/Divider";
import { Bound } from "@wayward/utilities/Decorators";
import Enums from "@wayward/game/utilities/enum/Enums";

import Prompts from "@wayward/game/game/meta/prompt/Prompts";
import { TextContext } from "@wayward/game/language/ITranslation";
import Button from "@wayward/game/ui/component/Button";
import { TarsMode } from "../../core/ITars";
import type Tars from "../../core/Tars";
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
					void this.tarsInstance.toggle();
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

							void Rename.execute(localPlayer, npc, newName);
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
						.setTooltip(tooltip => tooltip.setText(getTarsTranslation(`DialogMode${TarsMode[mode]}Tooltip`)));
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

	protected onSwitchTo(): void {
		const events = this.tarsInstance.event.until(this, "switchAway", "remove");
		events.subscribe("enableChange", this.refresh);
		events.subscribe("optionsChange", this.refresh);
	}

	@Bound
	protected refresh(): void {
		this.buttonEnable.refresh(false);
		this.choiceListMode.refresh();

		const isManual = this.tarsInstance.saveData.options.mode === TarsMode.Manual;
		this.choiceListMode.setDisabled(isManual);
	}
}
