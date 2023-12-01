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

import type Translation from "@wayward/game/language/Translation";
import { CheckButton } from "@wayward/game/ui/component/CheckButton";
import type Component from "@wayward/game/ui/component/Component";
import Divider from "@wayward/game/ui/component/Divider";
import { RangeRow } from "@wayward/game/ui/component/RangeRow";
import type { IRefreshable } from "@wayward/game/ui/component/Refreshable";
import { Heading } from "@wayward/game/ui/component/Text";
import { Bound } from "@wayward/utilities/Decorators";

import ChoiceList, { Choice } from "@wayward/game/ui/component/ChoiceList";
import Dialog from "@wayward/game/ui/screen/screens/game/component/Dialog";
import { TarsOptionSection, TarsOptionSectionType, TarsTranslation, getTarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";
import TarsPanel from "../components/TarsPanel";

export default abstract class OptionsPanel extends TarsPanel {

	private readonly refreshableComponents: IRefreshable[] = [];

	constructor(tarsInstance: Tars, options: Array<TarsOptionSection | TarsTranslation | undefined>) {
		super(tarsInstance);

		for (const uiOption of options) {
			if (uiOption === undefined) {
				new Divider()
					.appendTo(this);
				continue;
			}

			if (typeof (uiOption) === "number") {
				new Heading()
					.setText(getTarsTranslation(uiOption))
					.appendTo(this);
				continue;
			}

			let optionComponent: Component & IRefreshable;

			const isDisabled = uiOption.isDisabled?.() ?? false;

			switch (uiOption.type) {
				case TarsOptionSectionType.Checkbox:
					optionComponent = new CheckButton()
						.setText(getTarsTranslation(uiOption.title))
						.setTooltip(tooltip => tooltip.setText(getTarsTranslation(uiOption.tooltip)))
						.setRefreshMethod(() => this.tarsInstance.saveData.options[uiOption.option] as boolean)
						.event.subscribe("willToggle", (_, checked) => {
							this.tarsInstance.updateOptions({ [uiOption.option]: checked });
							return true;
						})
						.setDisabled(isDisabled);
					break;

				case TarsOptionSectionType.Slider:
					const slider = uiOption.slider;

					const range = new RangeRow()
						.setLabel(label => label
							.setText(getTarsTranslation(uiOption.title))
						)
						.setTooltip(tooltip => tooltip
							.setText(getTarsTranslation(uiOption.tooltip))
							.setLocation(Dialog.TooltipLocation))
						.setDisplayValue(() => getTarsTranslation(TarsTranslation.DialogLabel).get(this.tarsInstance.saveData.options[uiOption.option] as number))
						.event.subscribe("change", (_, value) => {
							this.tarsInstance.updateOptions({ [uiOption.option]: value });
						})
						.setDisabled(isDisabled);

					range.editRange(range => range
						.setMin(typeof (slider.min) === "number" ? slider.min : slider.min(this.tarsInstance.getContext()))
						.setMax(typeof (slider.max) === "number" ? slider.max : slider.max(this.tarsInstance.getContext()))
						.setRefreshMethod(() => {
							range.setMin(typeof (slider.min) === "number" ? slider.min : slider.min(this.tarsInstance.getContext()))
							range.setMax(typeof (slider.max) === "number" ? slider.max : slider.max(this.tarsInstance.getContext()))
							return this.tarsInstance.saveData.options[uiOption.option] as number;
						}));

					optionComponent = range;
					break;

				case TarsOptionSectionType.Choice:
					optionComponent = new ChoiceList<Choice<any>>()
						.setChoices(Array.from(uiOption.choices).map(([textTranslation, tooltipTranslation, value]) =>
							new Choice(value)
								.setText(getTarsTranslation(textTranslation))
								.setTooltip(tooltip => tooltip
									.setText(getTarsTranslation(tooltipTranslation))
									.setLocation(handler => handler
										.add("off right", ".dialog", "sticky center")
										.add("off left", ".dialog", "sticky center")))
						))
						.setRefreshMethod(list => list.choices(choice => choice.id === this.tarsInstance.saveData.options[uiOption.option]).first()!)
						.event.subscribe("choose", (_, choice) => {
							this.tarsInstance.updateOptions({ [uiOption.option]: choice.id });
						})
						.setDisabled(isDisabled);
					break;
			}

			optionComponent.appendTo(this);

			this.refreshableComponents.push(optionComponent);
		}
	}

	public abstract override getTranslation(): TarsTranslation | Translation;

	protected onSwitchTo(): void {
		const events = this.tarsInstance.event.until(this, "switchAway", "remove");
		events.subscribe("optionsChange", this.refresh);
	}

	@Bound
	protected refresh(): void {
		for (const component of this.refreshableComponents) {
			component.refresh();
		}
	}
}
