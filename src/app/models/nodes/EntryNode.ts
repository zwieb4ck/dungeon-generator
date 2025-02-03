import { MathUtils, Vector2 } from "three";
import { ENodeType, Node } from "../Node";
import Room from "../Room";
import { EPinType, Pin } from "../Pin";

export default class EntryNode extends Room {

    constructor(position: Vector2, id: string = MathUtils.generateUUID()) {
        super(position, ENodeType.Entry, id, false);
        this.title = "New Entry Node";
        this.pins.push(new Pin(this.id, EPinType.Out));
    }

}
