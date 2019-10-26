define(["require", "exports", "../../IObjective", "../../Objective"], function (require, exports, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CopyContextData extends Objective_1.default {
        constructor(destination, source) {
            super();
            this.destination = destination;
            this.source = source;
        }
        getIdentifier() {
            return `CopyContextData:${this.source},${this.destination}`;
        }
        async execute(context) {
            const data = context.getData(this.source);
            context.setData(this.destination, data);
            this.log.info(`Copied ${data} from ${this.source} to ${this.destination}`);
            return IObjective_1.ObjectiveResult.Complete;
        }
    }
    exports.default = CopyContextData;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29weUNvbnRleHREYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvQ29udGV4dERhdGEvQ29weUNvbnRleHREYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUlBLE1BQXFCLGVBQXVFLFNBQVEsbUJBQVM7UUFFNUcsWUFBNkIsV0FBYyxFQUFtQixNQUFVO1lBQ3ZFLEtBQUssRUFBRSxDQUFDO1lBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFHO1lBQW1CLFdBQU0sR0FBTixNQUFNLENBQUk7UUFFeEUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxtQkFBbUIsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDN0QsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQVcsQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxTQUFTLElBQUksQ0FBQyxNQUFNLE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDM0UsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztRQUNqQyxDQUFDO0tBRUQ7SUFqQkQsa0NBaUJDIn0=