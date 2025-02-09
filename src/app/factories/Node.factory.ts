import { Vector2 } from "three";
import { ENodeType, Node, TNode } from "../models/Node";
import DefaultNode from "../models/nodes/DefaultNode";
import HallwayNode from "../models/nodes/HallwayNode";
import EntryNode from "../models/nodes/EntryNode";
import EliteNode from "../models/nodes/EliteNode";
import BossNode from "../models/nodes/BossNode";
import TeleporterNode from "../models/nodes/TeleporterNode";
import { Pin, TPin } from "../models/Pin";
import Room from "../models/Room";

export default class NodeFactory {
    static create(type: ENodeType, position: Vector2, id?: string, seed?: string): Room {
        switch (type) {
            case ENodeType.Room: return new DefaultNode(position, id, seed);
            case ENodeType.Hallway: return new HallwayNode(position, id, seed);
            case ENodeType.Entry: return new EntryNode(position, id, seed);
            case ENodeType.Elite: return new EliteNode(position, id, seed);
            case ENodeType.Boss: return new BossNode(position, id, seed);
            case ENodeType.Teleport: return new TeleporterNode(position, id, seed);
        }
    }

    static createFromJson(json: TNode): Room {
        let newNode = NodeFactory.create(json.type, new Vector2(json.position.x, json.position.y), json.id, json.seed);
        newNode.title = json.title;
        newNode.pins = [];
        json.pins.forEach((p: TPin) => {
            const pin = new Pin(p.relatedId, p.type, p.id);
            pin.hasConnection = p.hasConnection;
            newNode.pins.push(pin);
        });
        //properties 
        newNode.assingProperties(json.properties);
        newNode.updateCache();
        return newNode;
    }
}