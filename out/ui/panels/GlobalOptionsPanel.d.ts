import type Translation from "language/Translation";
import Tars from "../../core/Tars";
import { TarsTranslation } from "../../ITarsMod";
import OptionsPanel from "./OptionsPanel";
export default class GlobalOptionsPanel extends OptionsPanel {
    constructor(tarsInstance: Tars);
    getTranslation(): TarsTranslation | Translation;
}
