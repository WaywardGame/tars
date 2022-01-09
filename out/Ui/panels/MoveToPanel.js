var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "game/entity/npc/INPCs", "game/doodad/IDoodad", "game/tile/ITerrain", "ui/component/Button", "ui/component/Divider", "ui/component/dropdown/DoodadDropdown", "ui/component/dropdown/IslandDropdown", "ui/component/dropdown/PlayerDropdown", "ui/component/dropdown/TerrainDropdown", "ui/component/dropdown/NPCDropdown", "ui/component/LabelledRow", "utilities/Decorators", "../../modes/MoveTo", "../components/TarsPanel", "../../ITarsMod"], function (require, exports, INPCs_1, IDoodad_1, ITerrain_1, Button_1, Divider_1, DoodadDropdown_1, IslandDropdown_1, PlayerDropdown_1, TerrainDropdown_1, NPCDropdown_1, LabelledRow_1, Decorators_1, MoveTo_1, TarsPanel_1, ITarsMod_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToPanel extends TarsPanel_1.default {
        constructor() {
            var _a, _b, _c, _d;
            super();
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonMoveToBase))
                .event.subscribe("activate", async () => {
                var _a;
                await ((_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Base,
                })));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelIsland)))
                .append(this.dropdownIsland = new IslandDropdown_1.default((_a = this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToIslandDropdown]) !== null && _a !== void 0 ? _a : localIsland.id)
                .event.subscribe("selection", async (_, selection) => {
                this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToIslandDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonMoveToIsland))
                .event.subscribe("activate", async () => {
                var _a;
                await ((_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Island,
                    islandId: this.dropdownIsland.selection,
                })));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            this.dropdownPlayer = new PlayerDropdown_1.default("");
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelPlayer)))
                .append(this.dropdownPlayer)
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonMoveToPlayer))
                .event.subscribe("activate", async () => {
                var _a;
                await ((_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Player,
                    playerIdentifier: this.dropdownPlayer.selection,
                })));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelDoodad)))
                .append(this.dropdownDoodad = new DoodadDropdown_1.default((_b = this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToDoodadDropdown]) !== null && _b !== void 0 ? _b : IDoodad_1.DoodadType.StoneCampfire)
                .event.subscribe("selection", async (_, selection) => {
                this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToDoodadDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonMoveToDoodad))
                .event.subscribe("activate", async () => {
                var _a;
                await ((_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Doodad,
                    doodadType: this.dropdownDoodad.selection,
                })));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelTerrain)))
                .append(this.dropdownTerrainType = new TerrainDropdown_1.default((_c = this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToTerrainDropdown]) !== null && _c !== void 0 ? _c : ITerrain_1.TerrainType.Grass)
                .event.subscribe("selection", async (_, selection) => {
                this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToTerrainDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonMoveToTerrain))
                .event.subscribe("activate", async () => {
                var _a;
                await ((_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.Terrain,
                    terrainType: this.dropdownTerrainType.selection,
                })));
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            new LabelledRow_1.LabelledRow()
                .classes.add("dropdown-label")
                .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabelNPC)))
                .append(this.dropdownNPC = new NPCDropdown_1.default((_d = this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToNPCDropdown]) !== null && _d !== void 0 ? _d : INPCs_1.NPCType.Merchant)
                .event.subscribe("selection", async (_, selection) => {
                this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.MoveToNPCDropdown] = selection;
            }))
                .appendTo(this);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonMoveToNPC))
                .event.subscribe("activate", async () => {
                var _a;
                await ((_a = this.TarsMod.tarsInstance) === null || _a === void 0 ? void 0 : _a.activateManualMode(new MoveTo_1.MoveToMode({
                    type: MoveTo_1.MoveToType.NPC,
                    npcType: this.dropdownNPC.selection,
                })));
                return true;
            })
                .appendTo(this);
        }
        getTranslation() {
            return ITarsMod_1.TarsTranslation.DialogPanelMoveTo;
        }
        onSwitchTo() {
            const events = playerManager.event.until(this, "switchAway", "remove");
            events.subscribe("join", this.refresh);
            events.subscribe("leave", this.refresh);
        }
        refresh() {
            var _a;
            this.dropdownPlayer.refresh();
            (_a = this.dropdownPlayer.options.get(localPlayer.identifier)) === null || _a === void 0 ? void 0 : _a.setDisabled(true);
        }
    }
    __decorate([
        Decorators_1.Bound
    ], MoveToPanel.prototype, "refresh", null);
    exports.default = MoveToPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdWkvcGFuZWxzL01vdmVUb1BhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQW1CQSxNQUFxQixXQUFZLFNBQVEsbUJBQVM7UUFROUM7O1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLGdCQUFNLEVBQUU7aUJBQ1AsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2lCQUNuRSxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxLQUFLLElBQUksRUFBRTs7Z0JBQ3BDLE1BQU0sQ0FBQSxNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSwwQ0FBRSxrQkFBa0IsQ0FBQyxJQUFJLG1CQUFVLENBQUM7b0JBQy9ELElBQUksRUFBRSxtQkFBVSxDQUFDLElBQUk7aUJBQ3hCLENBQUMsQ0FBQyxDQUFBLENBQUM7Z0JBQ0osT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxDQUFDO2lCQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVwQixJQUFJLGlCQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0IsSUFBSSx5QkFBVyxFQUFFO2lCQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7aUJBQzdCLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBQSw2QkFBa0IsRUFBQywwQkFBZSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztpQkFDdkYsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSx3QkFBYyxDQUFDLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLDRCQUFpQixDQUFDLG9CQUFvQixDQUFDLG1DQUFJLFdBQVcsQ0FBQyxFQUFFLENB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