import type Translation from "language/Translation";
import type { SubpanelInformation } from "ui/screen/screens/game/component/TabDialog";
import TabDialog from "ui/screen/screens/game/component/TabDialog";
import type { DialogId, IDialogDescription } from "ui/screen/screens/game/Dialogs";
import type TarsMod from "../TarsMod";
import type TarsPanel from "./components/TarsPanel";
export declare type TabDialogPanelClass = new () => TarsPanel;
export default class TarsDialog extends TabDialog<TarsPanel> {
    static description: IDialogDescription;
    readonly TarsMod: TarsMod;
    constructor(id: DialogId);
    protected getDefaultSubpanelInformation(): SubpanelInformation;
    protected onChangeSubpanel(activeSubpanel: SubpanelInformation): void;
    getName(): Translation;
    protected getSubpanels(): TarsPanel[];
    protected getSubpanelInformation(subpanels: TarsPanel[]): SubpanelInformation[];
}
