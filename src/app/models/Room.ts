import { MathUtils, Vector2 } from 'three';
import { ENodeType, Node, TNode } from './Node';
import { generateSeed } from '../utils/generateSeed';
import { PRNG } from './prng';
import {
  EDirection,
  TDungeonTile,
  TTileConnections,
} from '../services/generator/generator.service';
import { ObjectsService } from '../services/objects/objects.service';
import { Subject } from 'rxjs';
import { Connection } from './Connection';

export enum EOrientation {
  North,
  East,
  South,
  West,
}

export enum EPropertiesType {
  String,
  Boolean,
  Number,
  Range,
  Text,
  Button,
}

export type TRoomConnection = {
  x: number;
  y: number;
  dir: EOrientation;
};

export type TRoom = {
  height: number;
  width: number;
  type: string;
  connections: TRoomConnection[];
};

export type TProperty = {
  type: EPropertiesType;
  label: string;
  id: number;
} & (
  | {
      type: EPropertiesType.Range;
      min: number;
      max: number;
      propName: Record<string, string>;
    }
  | {
      type: EPropertiesType.Button;
      action: () => void;
      buttonLabel: string;
    }
  | {
      type:
        | EPropertiesType.Boolean
        | EPropertiesType.String
        | EPropertiesType.Number
        | EPropertiesType.Text;
      model: any;
      propName: string;
    }
);

export default class Room extends Node {
  // default properties
  public minRoomWidth: number = 1;
  public maxRoomWidth: number = 3;
  public minRoomHeight: number = 1;
  public maxRoomHeight: number = 3;
  public propertyCache: TProperty[] = [];

  public get Properties(): TProperty[] {
    return this.propertyCache;
  }

  private roomHeight: number = 0;
  private roomWidth: number = 0;

  private _room: TRoom | null = null;

  public roomUpdater: Subject<TRoom> = new Subject();
  public get Room(): TRoom | null {
    return this._room;
  }

  constructor(
    position: Vector2,
    type: ENodeType,
    id: string = MathUtils.generateUUID(),
    createInitialPins: boolean,
    seed: string = ''
  ) {
    super(position, type, id, createInitialPins, seed);
    this.updateCache();
  }

  public get maxConnections(): number {
    return (this.roomHeight + this.roomWidth) * 2;
  }

  private connections: Connection[] = [];

  public updateCache() {
    this.propertyCache = [
      {
        id: 0,
        type: EPropertiesType.String,
        model: this.title,
        label: 'Title',
        propName: 'title',
      },
      {
        id: 1,
        type: EPropertiesType.Boolean,
        model: this.isStart,
        label: 'Is Start?',
        propName: 'isStart',
      },
      {
        id: 2,
        type: EPropertiesType.Range,
        min: this.minRoomHeight,
        max: this.maxRoomHeight,
        label: 'Room Height',
        propName: { min: 'minRoomHeight', max: 'maxRoomHeight' },
      },
      {
        id: 3,
        type: EPropertiesType.Range,
        min: this.minRoomWidth,
        max: this.maxRoomWidth,
        label: 'Room Width',
        propName: { min: 'minRoomWidth', max: 'maxRoomWidth' },
      },
      {
        id: 4,
        type: EPropertiesType.Text,
        model: this.seed,
        label: 'Seed',
        propName: 'seed',
      },
      {
        id: 5,
        type: EPropertiesType.Button,
        action: this.applyNewSeed.bind(this),
        label: 'Generate new seed',
        buttonLabel: 'Generate',
      },
      {
        id: 6,
        type: EPropertiesType.Button,
        action: this.logComponent.bind(this),
        label: 'Log Room',
        buttonLabel: 'Log',
      },
    ];
    this.generateRoom();
  }

  private logComponent() {
    console.log(this._room);
  }

  private applyNewSeed() {
    this.updateSeed(generateSeed());
    this.updateCache();
  }

  // utility
  public override toJson(): TNode {
    const res = super.toJson();
    return res;
  }

  public assignProperties(properties: TProperty[]) {
    properties.forEach((prop) => {
      this.updateProperty(prop);
    });
    this.updateCache();
  }

  public updateProperty(property: TProperty) {
    if (property.type === EPropertiesType.Range) {
      Object.entries(property.propName).forEach(([key, propKey]) => {
        (this as any)[propKey] = (property as any)[key];
      });
    } else if (
      property.type !== EPropertiesType.Button &&
      property.type !== EPropertiesType.Text
    ) {
      (this as any)[property.propName] = property.model;
    }
    this.updateCache();
  }

  protected override getProperties() {
    return this.propertyCache.filter((p) => p.type !== EPropertiesType.Button);
  }

  public updateConnections(connections: Connection[]) {
    this.connections = connections;
  }

  public generateRoom() {
    this.random = new PRNG(this.seed);
    this.roomHeight = this.random.nextRange(
      this.minRoomHeight,
      this.maxRoomHeight + 1
    );
    this.roomWidth = this.random.nextRange(
      this.minRoomWidth,
      this.maxRoomWidth + 1
    );
    this._room = {
      width: this.roomWidth,
      height: this.roomHeight,
      type: "any",
      connections: this.generateConnections(),
    };
    this.roomUpdater.next(this._room);
    return this._room;
  }

  public generateConnections() {
    const directions = [
      EOrientation.North,
      EOrientation.East,
      EOrientation.South,
      EOrientation.West,
    ];
    let considerableConnections: EOrientation[] = [];
    const connections: TRoomConnection[] = [];
    this.connections.forEach((c) => {
      if (considerableConnections.length === 0) {
        considerableConnections = [...directions];
      }
      const nextDirection = this.random.choice(considerableConnections);
      considerableConnections = considerableConnections.filter(
        (c) => c !== nextDirection
      );
      const position = this.getConnectionPosition(nextDirection);
      connections.push({
        x: position.x,
        y: position.y,
        dir: nextDirection,
      });
    });
    return connections;
  }

  private getConnectionPosition(direction: EOrientation) {
    switch (direction) {
      case EOrientation.North:
        return { x: this.random.nextRange(0, this.roomWidth - 1), y: 0 };
      case EOrientation.East:
        return {
          x: this.roomWidth - 1,
          y: this.random.nextRange(0, this.roomHeight - 1),
        };
      case EOrientation.South:
        return {
          x: this.random.nextRange(0, this.roomWidth - 1),
          y: this.roomHeight - 1,
        };
      case EOrientation.West:
        return { x: 0, y: this.random.nextRange(0, this.roomHeight - 1) };
    }
  }
}
