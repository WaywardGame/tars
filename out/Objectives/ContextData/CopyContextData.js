define(["require", "exports", "../../IContext", "../../IObjective", "../../Objective"], function (require, exports, IContext_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CopyContextData extends Objective_1.default {
        constructor(source, destination) {
            super();
            this.source = source;
            this.destination = destination;
        }
        getIdentifier() {
            return `CopyContextData:${IContext_1.ContextDataType[this.source]},${IContext_1.ContextDataType[this.destination]}`;
        }
        async execute(context) {
            const data = context.getData(this.source);
            context.setData(this.destination, data);
            this.log.info(`Copied ${data} from ${IContext_1.ContextDataType[this.source]} to ${IContext_1.ContextDataType[this.destination]}`);
            return IObjective_1.ObjectiveResult.Complete;
        }
    }
    exports.default = CopyContextData;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29weUNvbnRleHREYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29udGV4dERhdGEvQ29weUNvbnRleHREYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUtBLE1BQXFCLGVBQXVFLFNBQVEsbUJBQVM7UUFFNUcsWUFBNkIsTUFBUyxFQUFtQixXQUFlO1lBQ3ZFLEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQUc7WUFBbUIsZ0JBQVcsR0FBWCxXQUFXLENBQUk7UUFFeEUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxtQkFBbUIsMEJBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksMEJBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztRQUMvRixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFeEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLFNBQVMsMEJBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sMEJBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzdHLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7UUFDakMsQ0FBQztLQUVEO0lBbEJELGtDQWtCQyJ9