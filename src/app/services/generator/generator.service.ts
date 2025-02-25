import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ObjectsService } from '../objects/objects.service';
import { PRNG } from '../../models/prng';
import { StorageService } from '../storage/storage.service';
import { ENodeType } from '../../models/Node';
import Room, { TRoom, TRoomConnection } from '../../models/Room';

export enum EOrientation {
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
  dir: EOrientation
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

  public dungeonSubject: Subject<TRoom[]> = new Subject();
  private random: PRNG = new PRNG();
  private dungeon: TRoom[] = [];

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
    const room = node.Room as TRoom;
    room.pos = position;
    this.dungeon.push(room);

    const connections = this.objectService.getConnectionsById(node.id);
    node.updateConnections(connections);
    node.generateRoom();
    console.log('room', room);
    console.log("Processing Node Connections:", connections, room);

    room.connections.forEach((connection) => {
      this.createRandomCorridor(room, connection);
    })
  }

  private createRandomCorridor(room: TRoom, connection: TRoomConnection) {
    const allPossibleDirections = [
      EOrientation.South,
      EOrientation.West,
      EOrientation.North,
      EOrientation.East
    ].filter(dir => dir !== this.getOppositeDirection(connection.dir));
  
    allPossibleDirections.push(connection.dir);
    const newDir = this.random.choice(allPossibleDirections);
  
    const corridorLength = this.random.nextRange(1, 3);
    const steps = this.random.percentageChance([1, 2, 3], [5, 3, 2]);
  
    this.createConnectionRoom(room, connection, newDir, corridorLength, steps);
  }
  

  private createConnectionRoom(
    prevRoom: TRoom, 
    connection: TRoomConnection, 
    newDir: EOrientation, 
    length: number, 
    steps: number
  ) {
    const newRoom: TRoom = {
      type: "corridor",
      pos: { x: prevRoom.pos.x, y: prevRoom.pos.y },
      height: 1,
      width: 1,
      connections: [],
    };
  
    switch (connection.dir) {
      case EOrientation.North:
        newRoom.pos.x = prevRoom.pos.x + connection.x;
        newRoom.pos.y = prevRoom.pos.y - length;
        newRoom.height = length;
        break;
      case EOrientation.East:
        newRoom.pos.x = prevRoom.pos.x + prevRoom.width;
        newRoom.pos.y = prevRoom.pos.y + connection.y;
        newRoom.width = length;
        break;
      case EOrientation.South:
        newRoom.pos.x = prevRoom.pos.x + connection.x;
        newRoom.pos.y = prevRoom.pos.y + prevRoom.height;
        newRoom.height = length;
        break;
      case EOrientation.West:
        newRoom.pos.x = prevRoom.pos.x - length;
        newRoom.pos.y = prevRoom.pos.y + connection.y;
        newRoom.width = length;
        break;
    }
  
    // Verbindung für den vorherigen Raum hinzufügen
    newRoom.connections.push({
      x: connection.dir === EOrientation.West ? length - 1 : 0,
      y: connection.dir === EOrientation.North ? length - 1 : 0,
      dir: this.getOppositeDirection(connection.dir),
      targetId: null,
    });
  
    this.dungeon.push(newRoom);
  
    // Falls noch weitere Schritte übrig sind, erstelle einen weiteren Korridor
    if (steps > 1) {
      this.createConnectionRoom(newRoom, { 
        x: 0, 
        y: 0, 
        dir: newDir, 
        targetId: null 
      }, newDir, length, steps - 1);
    } else {
      // Letzter Raum bekommt die echte targetId der Verbindung
      newRoom.connections.push({
        x: connection.dir === EOrientation.West ? length - 1 : 0,
        y: connection.dir === EOrientation.North ? length - 1 : 0,
        dir: newDir,
        targetId: connection.targetId,
      });
    }
  }
  

  private getOppositeDirection(dir: EOrientation): EOrientation {
    switch (dir) {
      case EOrientation.North: return EOrientation.South;
      case EOrientation.East: return EOrientation.West;
      case EOrientation.South: return EOrientation.North;
      case EOrientation.West: return EOrientation.East;
    }
  }
}
