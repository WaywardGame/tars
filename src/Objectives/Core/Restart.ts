import { ObjectiveResult } from "../../IObjective";
import Lambda from "./Lambda";


export default class Restart extends Lambda {

	constructor() {
		super(async () => ObjectiveResult.Restart);
	}

	public override getIdentifier(): string {
		return "Restart";
	}

}
