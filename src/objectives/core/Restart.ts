import { ObjectiveResult } from "../../core/objective/IObjective";
import Lambda from "./Lambda";

export default class Restart extends Lambda {

	public override readonly includePositionInHashCode: boolean = false;

	protected override readonly includeUniqueIdentifierInHashCode: boolean = false;

	constructor() {
		super(async () => ObjectiveResult.Restart);
	}

	public override getIdentifier(): string {
		return "Restart";
	}

}
