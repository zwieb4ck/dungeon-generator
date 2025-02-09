import { MathUtils, Vector2 } from "three";
import { ENodeType, Node } from "../Node";
import Room from "../Room";

export default class HallwayNode extends Room {

    public override minRoomWidth: number = 1;
    public override maxRoomWidth: number = 5;
    public override minRoomHeight: number = 1;
    public override maxRoomHeight: number = 5;

    constructor(position: Vector2, id: string = MathUtils.generateUUID(), seed: string = "") {
        super(position, ENodeType.Hallway, id, true, seed);
        this.title = "New Hallway Node";
    }

}

