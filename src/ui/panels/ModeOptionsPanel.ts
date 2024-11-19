import type Translation from "@wayward/game/language/Translation";
import type Tars from "../../core/Tars";

import { TarsTranslation, uiConfigurableModeOptions } from "../../ITarsMod";
import OptionsPanel from "./OptionsPanel";

export default class ModeOptionsPanel extends OptionsPanel {

	constructor(tarsInstance: Tars) {
		super(tarsInstance, uiConfigurableModeOptions);
	}

	public getTranslation(): TarsTranslation | Translation {
		return TarsTranslation.DialogPanelModeOptions;
	}

}
