define(["require", "exports", "../../core/objective/IObjective", "./Lambda"], function (require, exports, IObjective_1, Lambda_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Restart extends Lambda_1.default {
        constructor() {
            super(async () => IObjective_1.ObjectiveResult.Restart);
            this.includePositionInHashCode = false;
            this.includeUniqueIdentifierInHashCode = false;
        }
        getIdentifier() {
            return "Restart";
        }
    }
    exports.default = Restart;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdGFydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2NvcmUvUmVzdGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFHQSxNQUFxQixPQUFRLFNBQVEsZ0JBQU07UUFNMUM7WUFDQyxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyw0QkFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBTG5CLDhCQUF5QixHQUFZLEtBQUssQ0FBQztZQUV4QyxzQ0FBaUMsR0FBWSxLQUFLLENBQUM7UUFJL0UsQ0FBQztRQUVlLGFBQWE7WUFDNUIsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztLQUVEO0lBZEQsMEJBY0MifQ==