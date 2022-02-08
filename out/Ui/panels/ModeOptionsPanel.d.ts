import type Translation from "language/Translation";
import { TarsTranslation } from "../../ITarsMod";
import OptionsPanel from "./OptionsPanel";
export default class ModeOptionsPanel extends OptionsPanel {
    constructor();
    getTranslation(): TarsTranslation | Translation;
}
