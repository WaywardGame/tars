define(["require", "exports", "../../ITarsMod", "./OptionsPanel"], function (require, exports, ITarsMod_1, OptionsPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GlobalOptionsPanel extends OptionsPanel_1.default {
        constructor(tarsInstance) {
            super(tarsInstance, ITarsMod_1.uiConfigurableGlobalOptions);
        }
        getTranslation() {
            return ITarsMod_1.TarsTranslation.DialogPanelGlobalOptions;
        }
    }
    exports.default = GlobalOptionsPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmFsT3B0aW9uc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9HbG9iYWxPcHRpb25zUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBTUEsTUFBcUIsa0JBQW1CLFNBQVEsc0JBQVk7UUFFeEQsWUFBWSxZQUFrQjtZQUMxQixLQUFLLENBQUMsWUFBWSxFQUFFLHNDQUEyQixDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVNLGNBQWM7WUFDakIsT0FBTywwQkFBZSxDQUFDLHdCQUF3QixDQUFDO1FBQ3BELENBQUM7S0FFSjtJQVZELHFDQVVDIn0=