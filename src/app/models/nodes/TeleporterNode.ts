import { MathUtils, Vector2 } from "three";
import { ENodeType } from "../Node";
import Room from "../Room";

export default class TeleporterNode extends Room {

    public override minRoomWidth: number = 1;
    public override maxRoomWidth: number = 1;
    public override minRoomHeight: number = 1;
    public override maxRoomHeight: number = 1;

    constructor(position: Vector2, id: string = MathUtils.generateUUID()) {
        super(position, ENodeType.Teleport, id, true);
        this.title = "New Teleporter Node";
    }

}