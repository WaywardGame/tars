import type Translation from "language/Translation";
import TarsPanel from "../components/TarsPanel";
import { TarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";
import TarsMod from "../../TarsMod";
export default class DataPanel extends TarsPanel {
    readonly TarsMod: TarsMod;
    private readonly rows;
    constructor(tarsInstance: Tars);
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): Promise<void>;
}
