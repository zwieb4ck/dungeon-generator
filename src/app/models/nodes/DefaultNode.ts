import { MathUtils, Vector2 } from "three";
import { ENodeType, Node } from "../Node";
import Room from "../Room";

export default class DefaultNode extends Room {

    public override minRoomWidth: number = 1;
    public override maxRoomWidth: number = 2;
    public override minRoomHeight: number = 1;
    public override maxRoomHeight: number = 2;

    constructor(position: Vector2, id: string = MathUtils.generateUUID()) {
        super(position, ENodeType.Room, id, true);
        this.title = "New Default Node";
    }

}
