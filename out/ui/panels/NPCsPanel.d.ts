import Island from "game/island/Island";
import type Translation from "language/Translation";
import { TarsTranslation } from "../../ITarsMod";
import TarsMod from "../../TarsMod";
import Tars from "../../core/Tars";
import TarsPanel from "../components/TarsPanel";
export default class NPCsPanel extends TarsPanel {
    readonly TarsMod: TarsMod;
    private readonly rows;
    constructor(tarsInstance: Tars);
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected onIslandActivated(island: Island): void;
    protected onIslandDeactivated(island: Island): void;
    protected refresh(): Promise<void>;
}
