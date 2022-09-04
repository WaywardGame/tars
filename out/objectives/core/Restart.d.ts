import Lambda from "./Lambda";
export default class Restart extends Lambda {
    readonly includePositionInHashCode: boolean;
    protected readonly includeUniqueIdentifierInHashCode: boolean;
    constructor();
    getIdentifier(): string;
}
