import { OwnEventHandler } from "@wayward/utilities/event/EventManager";
import type Translation from "@wayward/game/language/Translation";
import TabDialogPanel from "@wayward/game/ui/screen/screens/game/component/TabDialogPanel";

import type { TarsTranslation } from "../../ITarsMod";
import type Tars from "../../core/Tars";

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
