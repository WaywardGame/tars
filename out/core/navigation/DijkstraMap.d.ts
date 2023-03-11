import { IVector2 } from "utilities/math/IVector";
import { Direction } from "utilities/math/Direction";
export interface IDijkstraMapNode extends IVector2 {
    penalty: number;
    disabled: boolean;
    connections: Map<Direction, IDijkstraMapNode>;
    parent?: IDijkstraMapNode;
    distance: number;
    score: number;
    closed?: boolean;
}
export declare class DijkstraMap {
    private readonly mapSize;
    private readonly nodes;
    private origin;
    constructor(mapSize: number);
    getNode(x: number, y: number): IDijkstraMapNode;
    updateNode(x: number, y: number, penalty: number, disabled: boolean): void;
    updateOrigin(origin: IVector2): void;
    findPath(end: IVector2): {
        success: boolean;
        path: IDijkstraMapNode[];
        score: number;
    } | undefined;
    private update;
    private reset;
}
