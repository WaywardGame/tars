import { OwnEventHandler } from "event/EventManager";
import Translation from "language/Translation";
import Mod from "mod/Mod";
import TabDialog, { SubpanelInformation } from "ui/screen/screens/game/component/TabDialog";
import { DialogId, Edge, IDialogDescription } from "ui/screen/screens/game/Dialogs";
import { Tuple } from "utilities/collection/Arrays";
import Vector2 from "utilities/math/Vector2";
import { getTarsTranslation, TarsTranslation, TarsUiSaveDataKey, TARS_ID } from "../ITars";
import Tars from "../Tars";
import TarsPanel from "./components/TarsPanel";
import GeneralPanel from "./panels/GeneralPanel";
import OptionsPanel from "./panels/OptionsPanel";
import TasksPanel from "./panels/TasksPanel";


export type TabDialogPanelClass = new () => TarsPanel;

/**
 * A list of panel classes that will appear in the dialog.
 */
const subpanelClasses: TabDialogPanelClass[] = [
	GeneralPanel,
	TasksPanel,
	OptionsPanel
];

export default class TarsDialog extends TabDialog<TarsPanel> {

	public static description: IDialogDescription = {
		minSize: new Vector2(30, 21),
		size: new Vector2(40, 70),
		maxSize: new Vector2(60, 70),
		edges: [
			[Edge.Left, 25],
			[Edge.Bottom, 33],
		],
	};

	@Mod.instance<Tars>(TARS_ID)
	public readonly TARS: Tars;

	public constructor(id: DialogId) {
		super(id);
		this.TARS.event.until(this, "remove").subscribe("statusChange", this.header.refresh);
	}

	protected getDefaultSubpanelInformation(): SubpanelInformation {
		for (const subpanelInformation of this.subpanelInformations) {
			if (subpanelInformation[0] === this.TARS.saveData.ui[TarsUiSaveDataKey.ActivePanelId]) {
				return subpanelInformation;
			}
		}

		return super.getDefaultSubpanelInformation();
	}

	@OwnEventHandler(TarsDialog, "changeSubpanel")
	protected onChangeSubpanel(activeSubpanel: SubpanelInformation) {
		this.TARS.saveData.ui[TarsUiSaveDataKey.ActivePanelId] = activeSubpanel[0];
	}

	@Override public getName(): Translation {
		return getTarsTranslation(TarsTranslation.DialogTitleMain).addArgs(this.TARS.getStatus);
	}

	/**
	 * Implements the abstract method in "TabDialog". Returns an array of subpanels.
	 * This will only be called once
	 */
	@Override protected getSubpanels(): TarsPanel[] {
		return subpanelClasses.map(cls => new cls());
	}

	/**
	 * Implements the abstract method in "TabDialog". Returns an array of tuples containing information used to set-up the
	 * subpanels of this dialog.
	 * 
	 * If the subpanel classes haven't been instantiated yet, it first instantiates them by calling getSubpanels.
	 * This includes binding a `WillRemove` event handler to the panel, which will `store` (cache) the panel instead of removing it,
	 * and trigger a `SwitchAway` event on the panel when this occurs.
	 */
	@Override protected getSubpanelInformation(subpanels: TarsPanel[]): SubpanelInformation[] {
		return subpanels
			.map(subpanel => Tuple(
				getTarsTranslation(subpanel.getTranslation()).getString(),
				getTarsTranslation(subpanel.getTranslation()),
				this.onShowSubpanel(subpanel),
			));
	}
}
