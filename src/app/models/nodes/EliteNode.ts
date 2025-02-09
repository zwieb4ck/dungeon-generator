import { MathUtils, Vector2 } from "three";
import { ENodeType, Node } from "../Node";
import Room from "../Room";

export default class EliteNode extends Room {

    public override minRoomWidth: number = 2;
    public override maxRoomWidth: number = 2;
    public override minRoomHeight: number = 2;
    public override maxRoomHeight: number = 2;

    constructor(position: Vector2, id: string = MathUtils.generateUUID(), seed: string = "") {
        super(position, ENodeType.Elite, id, true, seed);
        this.title = "New Elite Node";
    }

}
