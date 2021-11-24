var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "game/doodad/IDoodad", "game/tile/ITerrain", "ui/component/Button", "ui/component/Divider", "ui/component/dropdown/DoodadDropdown", "ui/component/dropdown/IslandDropdown", "ui/component/dropdown/PlayerDropdown", "ui/component/dropdown/TerrainDropdown", "ui/component/LabelledRow", "utilities/Decorators", "../../ITars", "../../mode/modes/MoveTo", "../components/TarsPanel"], function (require, exports, IDoodad_1, ITerrain_1, Button_1, Divider_1, DoodadDropdown_1, IslandDropdown_1, PlayerDropdown_1, TerrainDropdown_1, LabelledRow_1, Decorators_1, ITars_1, MoveTo_1, TarsPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToPanel extends TarsPanel_1.default {
        constructor() {
            var _a, _b, _c, _d;
            super();
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogLabelIsland)))
                .append(this.dropdownIsland = new IslandDropdown_1.default((_a = this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToIslandDropdown]) !== null && _a !== void 0 ? _a : localIsland.id)
                .event.subscribe("selection", async (_, selection) => {
                this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToIslandDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogButtonMoveToIsland))
                .event.subscribe("activate", async () => {
                console.log("this.dropdownIsland.selection", this.dropdownIsland.selection);
                await this.TARS.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Island,
                    islandId: this.dropdownIsland.selection,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogLabelTerrain)))
                .append(this.dropdownTerrainType = new TerrainDropdown_1.default((_b = this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToTerrainDropdown]) !== null && _b !== void 0 ? _b : ITerrain_1.TerrainType.Grass)
                .event.subscribe("selection", async (_, selection) => {
                this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToTerrainDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogButtonMoveToTerrain))
                .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Terrain,
                    terrainType: this.dropdownTerrainType.selection,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogLabelDoodad)))
                .append(this.dropdownDoodad = new DoodadDropdown_1.default((_c = this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToDoodadDropdown]) !== null && _c !== void 0 ? _c : IDoodad_1.DoodadType.StoneCampfire)
                .event.subscribe("selection", async (_, selection) => {
                this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.MoveToDoodadDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogButtonMoveToDoodad))
                .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Doodad,
                    doodadType: this.dropdownDoodad.selection,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            this.dropdownPlayer = new PlayerDropdown_1.default("");
            (_d = this.dropdownPlayer.options.get(localPlayer.identifier)) === null || _d === void 0 ? void 0 : _d.setDisabled(true);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogLabelPlayer)))
                .append(this.dropdownPlayer)
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogButtonMoveToPlayer))
                .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Player,
                    playerIdentifier: this.dropdownPlayer.selection,
                }));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new Button_1.default()
                .setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogButtonMoveToBase))
                .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Base,
                }));
                return true;
            })
                .appendTo(this);
        }
        getTranslation() {
            return ITars_1.TarsTranslation.DialogPanelMoveTo;
        }
        onSwitchTo() {
        }
        refresh() {
        }
    }
    __decorate([
        Decorators_1.Bound
    ], MoveToPanel.prototype, "refresh", null);
    exports.default = MoveToPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdWkvcGFuZWxzL01vdmVUb1BhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQWlCQSxNQUFxQixXQUFZLFNBQVEsbUJBQVM7UUFPOUM7O1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLHlCQUFXLEVBQUU7aUJBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztpQkFDN0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFBLDBCQUFrQixFQUFDLHVCQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2lCQUN2RixNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLHdCQUFjLENBQUMsTUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMseUJBQWlCLENBQUMsb0JBQW9CLENBQUMsbUNBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQztpQkFDNUgsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRTtnQkFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHlCQUFpQixDQUFDLG9CQUFvQixDQUFDLEdBQUcsU0FBUyxDQUFDO1lBQzlFLENBQUMsQ0FBQyxDQUFDO2lCQUNOLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVwQixJQUFJLGdCQUFNLEVBQUU7aUJBQ1AsT0FBTyxDQUFDLElBQUEsMEJBQWtCLEVBQUMsdUJBQWUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2lCQUNyRSxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxLQUFLLElBQUksRUFBRTtnQkFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsRUFBRSxJQUFJLENBQUMs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