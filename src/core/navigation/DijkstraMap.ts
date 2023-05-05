// http://www.roguebasin.com/index.php?title=The_Incredible_Power_of_Dijkstra_Maps
// http://www.roguebasin.com/index.php?title=Dijkstra_Maps_Visualized

import { IVector2 } from "utilities/math/IVector"
import { Direction } from "utilities/math/Direction"
import PriorityQueue, { PriorityQueueType } from "utilities/collection/queue/PriorityQueue";

export interface IDijkstraMapNode extends IVector2 {
    penalty: number;
    disabled: boolean;
    connections: Map<Direction, IDijkstraMapNode>;

    parent?: IDijkstraMapNode;
    distance: number;
    score: number;

    closed?: boolean;
}

/**
 * Too slow for TARS
 */
export class DijkstraMap {

    private readonly nodes: IDijkstraMapNode[] = [];

    private origin: IDijkstraMapNode | undefined;

    constructor(private readonly mapSize: number) {
        for (let x = 0; x < mapSize; x++) {
            for (let y = 0; y < mapSize; y++) {
                this.nodes[(y * mapSize) + x] = {
                    x,
                    y,
                    penalty: 0,
                    disabled: false,
                    distance: 0,
                    score: 0,
                    connections: new Map(),
                };
            }
        }

        for (let x = 0; x < mapSize; x++) {
            for (let y = 0; y < mapSize; y++) {
                const node = this.getNode(x, y);

                if (x != 0) {
                    node.connections.set(Direction.West, this.getNode(x - 1, y));
                }

                if (x != mapSize - 1) {
                    node.connections.set(Direction.East, this.getNode(x + 1, y));
                }

                if (y != 0) {
                    node.connections.set(Direction.North, this.getNode(x, y - 1));
                }

                if (y != mapSize - 1) {
                    node.connections.set(Direction.South, this.getNode(x, y + 1));
                }
            }
        }
    }

    public getNode(x: number, y: number) {
        return this.nodes[(y * this.mapSize) + x];
    }

    public updateNode(x: number, y: number, penalty: number, disabled: boolean) {
        const node = this.getNode(x, y);
        node.penalty = penalty;
        node.disabled = disabled;
    }

    public updateOrigin(origin: IVector2) {
        this.origin = this.getNode(origin.x, origin.y);
        this.update();

    }

    public findPath(end: IVector2): { success: boolean; path: IDijkstraMapNode[]; score: number; } | undefined {
        if (this.origin === undefined) {
            return undefined;
        }

        let endNode = this.getNode(end.x, end.y);

        const path: IDijkstraMapNode[] = [];

        let success = false;

        let current: IDijkstraMapNode | undefined = endNode;
        while (current !== undefined) {
            path[current.distance] = current;

            if (current === this.origin) {
                success = true;
                break;
            }

            current = current.parent;
        }

        return {
            success,
            path,
            score: endNode.score,
        }
    }

    private update() {
        if (!this.origin) {
            return;
        }

        this.reset();

        const opened: PriorityQueue<IDijkstraMapNode> = new PriorityQueue(PriorityQueueType.LowestToHighest);
        opened.push(this.origin, 0);

        this.origin.parent = undefined;
        this.origin.distance = 0;
        this.origin.score = this.origin.penalty;

        while (true) {
            const current = opened.pop();
            if (current === undefined || current.closed) {
                break;
            }

            current.closed = true;

            const distance = current.distance;
            const score = current.score;

            for (const direction of Direction.CARDINALS) {
                const connection = current.connections.get(direction);
                if (connection === undefined || connection.closed || connection.disabled) {
                    continue;
                }

                const tentativeScore = score + 1 + connection.penalty;
                if (tentativeScore < connection.score) {
                    opened.push(connection, tentativeScore);

                    connection.parent = current;
                    connection.distance = distance + 1;
                    connection.score = tentativeScore;
                }
            }
        }
    }

    private reset() {
        for (const node of this.nodes) {
            node.parent = undefined;
            node.closed = false;
            node.distance = 0;
            node.score = 999999999;
        }
    }
}
