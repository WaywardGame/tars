import type Translation from "language/Translation";
import { TarsTranslation } from "../../ITarsMod";
import OptionsPanel from "./OptionsPanel";
export default class GlobalOptionsPanel extends OptionsPanel {
    constructor();
    getTranslation(): TarsTranslation | Translation;
}
