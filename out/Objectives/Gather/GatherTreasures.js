define(["require", "exports", "../../core/objective/Objective", "./GatherTreasure"], function (require, exports, Objective_1, GatherTreasure_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherTreasures extends Objective_1.default {
        constructor(drawnMaps, options) {
            super();
            this.drawnMaps = drawnMaps;
            this.options = options;
        }
        getIdentifier() {
            return `GatherTreasures:${this.drawnMaps.join(",")}`;
        }
        getStatus() {
            return "Gathering treasure";
        }
        async execute(context) {
            return this.drawnMaps.map(drawnMap => [new GatherTreasure_1.default(drawnMap, this.options)]);
        }
    }
    exports.default = GatherTreasures;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyVHJlYXN1cmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlclRyZWFzdXJlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxNQUFxQixlQUFnQixTQUFRLG1CQUFTO1FBRWxELFlBQTZCLFNBQXFCLEVBQW1CLE9BQXlDO1lBQzFHLEtBQUssRUFBRSxDQUFDO1lBRGlCLGNBQVMsR0FBVCxTQUFTLENBQVk7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBa0M7UUFFOUcsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxtQkFBbUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN6RCxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sb0JBQW9CLENBQUM7UUFDaEMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSx3QkFBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7S0FFSjtJQWxCRCxrQ0FrQkMifQ==