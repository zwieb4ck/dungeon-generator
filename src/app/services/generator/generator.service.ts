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

  public dungeonSubject: Subject<TDungeonTile[]> = new Subject();
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
    this.dungeonSubject.next(this.dungeon);
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
        this.createRandomCorridor(room, { pos: connectionPos, dir: direction });
      } else {
        console.warn("Max attempts reached for connection placement, skipping this connection.");
      }
    });
  }

  private createRandomCorridor(room: TDungeonTile, connection: TTileConnections) {
    const corridorAmount = this.random.nextRange(1, 4);
    let directions = this.getAllDirectionsButOpposite(connection.dir);
    let currentConnection = connection;
    let currentRoom = room;
    for (let i = 0; i < corridorAmount; i++) {
      const length = this.random.nextRange(1, 4);
      const nextDirection = this.random.choice(directions);
      const { room, connection } = this.createCorridor(currentRoom, currentConnection, nextDirection, length);
      currentRoom = room;
      currentConnection = connection!;
      directions = directions.filter(d => d !== this.getOppositeDirection(nextDirection));
    }
  }

  private createCorridor(room: TDungeonTile, connection: TTileConnections, toDirection: EDirection, length: number) {
    const corridor: TDungeonTile = {
      type: ENodeType.Path,
      w: connection.dir === EDirection.East || connection.dir === EDirection.West ? length : 1,
      h: connection.dir === EDirection.North || connection.dir === EDirection.South ? length : 1,
      pos: {
        x: 0,
        y: 0,
      },
      connections: [],
    }

    switch (connection.dir) {
      case EDirection.North:
        corridor.pos.x = room.pos.x + connection.pos.x;
        corridor.pos.y = room.pos.y - length;
        break;
      case EDirection.East:
        corridor.pos.x = room.pos.x + room.w;
        corridor.pos.y = room.pos.y + connection.pos.y;
        break;
      case EDirection.South:
        corridor.pos.x = room.pos.x + connection.pos.x;
        corridor.pos.y = room.pos.y + room.h;
        break;
      case EDirection.West:
        corridor.pos.x = room.pos.x - length;
        corridor.pos.y = room.pos.y + connection.pos.y;
        break;
    }

    const { start, end } = this.getConnection(connection.dir, toDirection, length);
    corridor.connections.push(start!);
    corridor.connections.push(end!);

    this.dungeon.push(corridor);
    return {room: corridor, connection: end};
  }

  private getConnection(currentDirection: EDirection, nextDirection: EDirection, length: number) {
    const connections: { start: TTileConnections | null, end: TTileConnections | null } = { start: null, end: null };
    switch (currentDirection) {
      case EDirection.North:
        connections.start = {
          pos: {
            x: 0,
            y: 0 + length - 1,
          }, dir: EDirection.South
        };
        connections.end = {
          pos: {
            x: 0,
            y: 0,
          }, dir: nextDirection
        };
        break;
      case EDirection.East:
        connections.start = {
          pos: {
            x: 0,
            y: 0,
          }, dir: EDirection.West
        };
        connections.end = {
          pos: {
            x: 0 + length - 1,
            y: 0,
          }, dir: nextDirection
        };
        break;
      case EDirection.South:
        connections.start = {
          pos: {
            x: 0,
            y: 0,
          }, dir: EDirection.North
        };
        connections.end = {
          pos: {
            x: 0,
            y: 0 + length - 1,
          }, dir: nextDirection
        };
        break;
      case EDirection.West:
        connections.start = {
          pos: {
            x: 0 + length - 1,
            y: 0,
          }, dir: EDirection.East
        };
        connections.end = {
          pos: {
            x: 0,
            y: 0,
          }, dir: nextDirection
        };
        break;
    }
    return connections;
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
  private getOppositeDirection(dir: EDirection): EDirection {
    switch (dir) {
      case EDirection.North:
        return EDirection.South;
      case EDirection.East:
        return EDirection.West;
      case EDirection.South:
        return EDirection.North;
      case EDirection.West:
        return EDirection.East;
    }
  }
  private getAllDirectionsButOpposite(dir: EDirection): EDirection[] {
    const allDirections = [EDirection.North, EDirection.East, EDirection.South, EDirection.West];
    const opposite = this.getOppositeDirection(dir);
    return allDirections.filter(d => d !== opposite);
  }
}
