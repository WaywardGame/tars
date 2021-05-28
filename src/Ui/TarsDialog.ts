import Translation from "language/Translation";
import Mod from "mod/Mod";
import { CheckButton } from "ui/component/CheckButton";
import ChoiceList, { Choice } from "ui/component/ChoiceList";
import { LabelledRow } from "ui/component/LabelledRow";
import Dialog from "ui/screen/screens/game/component/Dialog";
import { DialogId, Edge, IDialogDescription } from "ui/screen/screens/game/Dialogs";
import Spacer from "ui/screen/screens/menu/component/Spacer";
import Enums from "utilities/enum/Enums";
import Vector2 from "utilities/math/Vector2";

import { TarsMode, TarsTranslation, TARS_ID } from "../ITars";
import Tars from "../Tars";

export default class TarsDialog extends Dialog {

	public static description: IDialogDescription = {
		minSize: new Vector2(15, 21),
		size: new Vector2(15, 21),
		maxSize: new Vector2(20, 35),
		edges: [
			[Edge.Left, 25],
			[Edge.Bottom, 33],
		],
	};

	@Mod.instance<Tars>(TARS_ID)
	public readonly TARS: Tars;

	private readonly statusLabel: LabelledRow;
	private readonly enableButton: CheckButton;
	private readonly modeChoiceList: ChoiceList<Choice<TarsMode>>;

	public constructor(id: DialogId) {
		super(id);

		this.registerHookHost("TarsDialog");

		this.statusLabel = new LabelledRow()
			.setLabel(label => label.setText(this.TARS.getTranslation(TarsTranslation.DialogLabelStatus).addArgs(this.TARS.getStatus)))
			.appendTo(this.body);

		this.enableButton = new CheckButton()
			.setText(this.TARS.getTranslation(TarsTranslation.DialogButtonEnable))
			.setRefreshMethod(() => this.TARS.isEnabled())
			.event.subscribe("willToggle", (_, checked) => {
				if (this.TARS.isEnabled() !== checked) {
					this.TARS.toggle();
				}

				return true;
			})
			.appendTo(this.body);

		new Spacer().appendTo(this.body);

		const modes = Enums.values(TarsMode);

		this.modeChoiceList = new ChoiceList<Choice<TarsMode>>()
			.setChoices(...modes.map(mode => new Choice(mode)
				.setText(this.TARS.getTranslation(`DialogMode${TarsMode[mode]}`))))
			.setRefreshMethod(list => list.choices(choice => choice.id === this.TARS.getMode()).first()!)
			.event.subscribe("choose", (_, choice) => {
				this.TARS.setMode(choice.id);
			})
			.appendTo(this.body);

		const events = this.TARS.event.until(this, "close");
		events.subscribe("enableChange", this.refresh);
		events.subscribe("statusChange", (_, status) => {
			// don't call refresh because we already calculated status when passing it to this method
			// this.statusLabel.refresh();
			this.statusLabel.setLabel(label => label.setText(this.TARS.getTranslation(TarsTranslation.DialogLabelStatus).addArgs(status)));
		});
	}

	@Override public getName(): Translation {
		return this.TARS.getTranslation(TarsTranslation.DialogTitleMain);
	}

	@Bound
	private refresh() {
		this.enableButton.refresh();
		this.modeChoiceList.refresh();
	}
}
