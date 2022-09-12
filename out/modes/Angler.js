define(["require", "exports", "./BaseMode", "../objectives/other/tile/Fish"], function (require, exports, BaseMode_1, Fish_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AnglerMode = void 0;
    class AnglerMode extends BaseMode_1.BaseMode {
        async initialize(_, finished) {
        }
        async determineObjectives(context) {
            const objectives = [];
            objectives.push(...await this.getBuildAnotherChestObjectives(context));
            objectives.push(new Fish_1.default());
            return objectives;
        }
    }
    exports.AnglerMode = AnglerMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5nbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL0FuZ2xlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBVUEsTUFBYSxVQUFXLFNBQVEsbUJBQVE7UUFFaEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7UUFDeEUsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjtZQUNoRCxNQUFNLFVBQVUsR0FBcUMsRUFBRSxDQUFDO1lBRXhELFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBRXZFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxjQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRTVCLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FDRDtJQWRELGdDQWNDIn0=