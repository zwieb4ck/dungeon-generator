import { MathUtils, Vector2 } from "three";
import { ENodeType, Node } from "../Node";
import Room from "../Room";

export default class BossNode extends Room {

    public override minRoomWidth: number = 3;
    public override maxRoomWidth: number = 5;
    public override minRoomHeight: number = 3;
    public override maxRoomHeight: number = 5;

    constructor(position: Vector2, id: string = MathUtils.generateUUID(), seed: string = "") {
        super(position, ENodeType.Boss, id, true, seed);
        this.title = "New Boss Node";
    }

}

