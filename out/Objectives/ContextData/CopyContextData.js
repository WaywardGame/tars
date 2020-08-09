define(["require", "exports", "../../Context", "../../IObjective", "../../Objective"], function (require, exports, Context_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CopyContextData extends Objective_1.default {
        constructor(source, destination) {
            super();
            this.source = source;
            this.destination = destination;
        }
        getIdentifier() {
            return `CopyContextData:${Context_1.ContextDataType[this.source]},${Context_1.ContextDataType[this.destination]}`;
        }
        async execute(context) {
            const data = context.getData(this.source);
            context.setData(this.destination, data);
            this.log.info(`Copied ${data} from ${Context_1.ContextDataType[this.source]} to ${Context_1.ContextDataType[this.destination]}`);
            return IObjective_1.ObjectiveResult.Complete;
        }
    }
    exports.default = CopyContextData;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29weUNvbnRleHREYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvQ29udGV4dERhdGEvQ29weUNvbnRleHREYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUlBLE1BQXFCLGVBQXVFLFNBQVEsbUJBQVM7UUFFNUcsWUFBNkIsTUFBUyxFQUFtQixXQUFlO1lBQ3ZFLEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQUc7WUFBbUIsZ0JBQVcsR0FBWCxXQUFXLENBQUk7UUFFeEUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxtQkFBbUIseUJBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUkseUJBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztRQUMvRixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBVyxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLFNBQVMseUJBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8seUJBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzdHLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7UUFDakMsQ0FBQztLQUVEO0lBbEJELGtDQWtCQyJ9