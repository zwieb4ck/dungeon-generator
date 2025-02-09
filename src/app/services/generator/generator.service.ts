import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ObjectsService } from '../objects/objects.service';
import { PRNG } from '../../models/prng';
import { StorageService } from '../storage/storage.service';
import { ENodeType } from '../../models/Node';

export enum EDirection {
  North,
  East,
  South,
  West,
}

export type TTileConnections = {
  pos: {
    x: number,
    y: number,
  },
  dir: EDirection
}

export type TDungeonTile =
  {
    type: ENodeType,
    w: number,
    h: number,
    pos: {
      x: number,
      y: number,
    },
    connections: TTileConnections[];
  }

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {

  public dungeonSubject: Subject<TDungeonTile[][]> = new Subject();
  private random: PRNG = new PRNG();
  private dungeon: TDungeonTile[] = [];

  constructor(private objectService: ObjectsService, private storageService: StorageService) {
    this.objectService.UpdateSubject.subscribe(() => {
      this.generateDungeon();
    });
  }

  public generateDungeon() {
    this.random = new PRNG(this.storageService.currentProject?.seed);
    this.dungeon = [];

    const startNode = this.objectService.getFirstNode();
    if (!startNode) {
      console.warn("No start node found!");
      return;
    }

    console.log("Start Node:", startNode);
    this.processNode(startNode, { x: 0, y: 0 });
    
    console.log("Final Dungeon Structure:", this.dungeon);
    this.dungeonSubject.next([this.dungeon]);
  }

  private processNode(node: any, position: { x: number, y: number }) {
    const room = node.regenerateRoom();
    room.pos = position;
    this.dungeon.push(room);
    
    const connections = this.objectService.getConnectionsById(node.id);
    console.log("Processing Node Connections:", connections);

    connections.forEach((connection) => {
      if (!connection.to) {
        console.warn("Skipping connection with null target.");
        return;
      }
      
      let attempts = 0;
      const maxAttempts = room.w * 2 + room.h * 2;
      let direction: EDirection;
      let connectionPos: { x: number, y: number };

      do {
        direction = this.random.choice([EDirection.North, EDirection.East, EDirection.South, EDirection.West]);
        connectionPos = this.getValidConnectionPoint(room, direction);
        attempts++;
      } while (
        room.connections.some((conn: TTileConnections) => conn.pos.x === connectionPos.x && conn.pos.y === connectionPos.y && conn.dir === direction)
        && attempts < maxAttempts
      );

      if (attempts < maxAttempts) {
        room.connections.push({ pos: connectionPos, dir: direction });

        const nextNode = this.objectService.getNodeById(connection.to.relatedId);
        if (nextNode && !this.dungeon.some(r => r.pos.x === connectionPos.x && r.pos.y === connectionPos.y)) {
        //this.processNode(nextNode, this.calculateNextPosition(position, direction, room));
        }
      } else {
        console.warn("Max attempts reached for connection placement, skipping this connection.");
      }
    });
  }

  private calculateNextPosition(currentPos: { x: number, y: number }, direction: EDirection, room: TDungeonTile): { x: number, y: number } {
    switch (direction) {
      case EDirection.North:
        return { x: currentPos.x, y: currentPos.y - room.h };
      case EDirection.East:
        return { x: currentPos.x + room.w, y: currentPos.y };
      case EDirection.South:
        return { x: currentPos.x, y: currentPos.y + room.h };
      case EDirection.West:
        return { x: currentPos.x - room.w, y: currentPos.y };
    }
  }

  private getValidConnectionPoint(room: TDungeonTile, direction: EDirection): { x: number, y: number } {
    switch (direction) {
      case EDirection.North:
        return { x: this.random.nextRange(0, room.w), y: 0 };
      case EDirection.East:
        return { x: room.w - 1, y: this.random.nextRange(0, room.h) };
      case EDirection.South:
        return { x: this.random.nextRange(0, room.w), y: room.h - 1 };
      case EDirection.West:
        return { x: 0, y: this.random.nextRange(0, room.h) };
    }
  }
}
