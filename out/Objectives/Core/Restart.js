define(["require", "exports", "../../IObjective", "./Lambda"], function (require, exports, IObjective_1, Lambda_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Restart extends Lambda_1.default {
        constructor() {
            super(async () => IObjective_1.ObjectiveResult.Restart);
        }
        getIdentifier() {
            return "Restart";
        }
    }
    exports.default = Restart;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdGFydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2NvcmUvUmVzdGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFJQSxNQUFxQixPQUFRLFNBQVEsZ0JBQU07UUFFMUM7WUFDQyxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyw0QkFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFZSxhQUFhO1lBQzVCLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7S0FFRDtJQVZELDBCQVVDIn0=