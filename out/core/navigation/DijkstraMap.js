define(["require", "exports", "utilities/math/Direction", "utilities/collection/queue/PriorityQueue"], function (require, exports, Direction_1, PriorityQueue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DijkstraMap = void 0;
    class DijkstraMap {
        constructor() {
            this.nodes = [];
            for (let x = 0; x < game.mapSize; x++) {
                for (let y = 0; y < game.mapSize; y++) {
                    this.nodes[(y * game.mapSize) + x] = {
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
            for (let x = 0; x < game.mapSize; x++) {
                for (let y = 0; y < game.mapSize; y++) {
                    const node = this.getNode(x, y);
                    if (x != 0) {
                        node.connections.set(Direction_1.Direction.West, this.getNode(x - 1, y));
                    }
                    if (x != game.mapSize - 1) {
                        node.connections.set(Direction_1.Direction.East, this.getNode(x + 1, y));
                    }
                    if (y != 0) {
                        node.connections.set(Direction_1.Direction.North, this.getNode(x, y - 1));
                    }
                    if (y != game.mapSize - 1) {
                        node.connections.set(Direction_1.Direction.South, this.getNode(x, y + 1));
                    }
                }
            }
        }
        getNode(x, y) {
            return this.nodes[(y * game.mapSize) + x];
        }
        updateNode(x, y, penalty, disabled) {
            const node = this.getNode(x, y);
            node.penalty = penalty;
            node.disabled = disabled;
        }
        updateOrigin(origin) {
            this.origin = this.getNode(origin.x, origin.y);
            this.update();
        }
        findPath(end) {
            if (this.origin === undefined) {
                return undefined;
            }
            let endNode = this.getNode(end.x, end.y);
            const path = [];
            let success = false;
            let current = endNode;
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
            };
        }
        update() {
            if (!this.origin) {
                return;
            }
            this.reset();
            const opened = new PriorityQueue_1.default(PriorityQueue_1.PriorityQueueType.LowestToHighest);
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
                for (const direction of Direction_1.Direction.CARDINALS) {
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
        reset() {
            for (const node of this.nodes) {
                node.parent = undefined;
                node.closed = false;
                node.distance = 0;
                node.score = 999999999;
            }
        }
    }
    exports.DijkstraMap = DijkstraMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlqa3N0cmFNYXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9uYXZpZ2F0aW9uL0RpamtzdHJhTWFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFzQkEsTUFBYSxXQUFXO1FBTXBCO1lBSmlCLFVBQUssR0FBdUIsRUFBRSxDQUFDO1lBSzVDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUc7d0JBQ2pDLENBQUM7d0JBQ0QsQ0FBQzt3QkFDRCxPQUFPLEVBQUUsQ0FBQzt3QkFDVixRQUFRLEVBQUUsS0FBSzt3QkFDZixRQUFRLEVBQUUsQ0FBQzt3QkFDWCxLQUFLLEVBQUUsQ0FBQzt3QkFDUixXQUFXLEVBQUUsSUFBSSxHQUFHLEVBQUU7cUJBQ3pCLENBQUM7aUJBQ0w7YUFDSjtZQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDbkMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBRWhDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDUixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxxQkFBUyxDQUFD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