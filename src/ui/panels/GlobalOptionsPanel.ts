import type Translation from "@wayward/game/language/Translation";

import type Tars from "../../core/Tars";
import { TarsTranslation, uiConfigurableGlobalOptions } from "../../ITarsMod";
import OptionsPanel from "./OptionsPanel";

export default class GlobalOptionsPanel extends OptionsPanel {

	constructor(tarsInstance: Tars) {
		super(tarsInstance, uiConfigurableGlobalOptions);
	}

	public getTranslation(): TarsTranslation | Translation {
		return TarsTranslation.DialogPanelGlobalOptions;
	}

}
