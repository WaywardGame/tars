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

import { OwnEventHandler } from "@wayward/utilities/event/EventManager";
import type Translation from "@wayward/game/language/Translation";
import TabDialogPanel from "@wayward/game/ui/screen/screens/game/component/TabDialogPanel";

import { TarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";

export default abstract class TarsPanel extends TabDialogPanel {

	public abstract getTranslation(): TarsTranslation | Translation;

	protected abstract onSwitchTo(): void;

	protected abstract refresh(): void;

	constructor(protected readonly tarsInstance: Tars) {
		super();
	}

	@OwnEventHandler(TarsPanel, "switchTo")
	protected _onSwitchTo(): void {
		this.onSwitchTo();
		this.refresh();
	}
}
