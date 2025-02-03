import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { default as example } from "./testdata/testdungeon.json";
import { ObjectsService, TObjectServiceUpdate } from '../objects/objects.service';

export enum ETileType {
  Hallway,
  Room
}

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
    type: ETileType,
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

  constructor(private objectService: ObjectsService) {
    this.objectService.UpdateSubject.subscribe((update: TObjectServiceUpdate) => {
      this.generateDungeon(update);
    });
  }

  public generateDungeon(elements: TObjectServiceUpdate) {
    this.dungeonSubject.next(example);
  }

}
