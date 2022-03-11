import type Translation from "language/Translation";

import { TarsTranslation, uiConfigurableModeOptions } from "../../ITarsMod";
import OptionsPanel from "./OptionsPanel";

export default class ModeOptionsPanel extends OptionsPanel {

    constructor() {
        super(uiConfigurableModeOptions);
    }

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelModeOptions;
    }

}
