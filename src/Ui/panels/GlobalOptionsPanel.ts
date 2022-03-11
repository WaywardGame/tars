import type Translation from "language/Translation";

import { TarsTranslation, uiConfigurableGlobalOptions } from "../../ITarsMod";
import OptionsPanel from "./OptionsPanel";

export default class GlobalOptionsPanel extends OptionsPanel {

    constructor() {
        super(uiConfigurableGlobalOptions);
    }

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelGlobalOptions;
    }

}
