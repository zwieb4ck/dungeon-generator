import { Injectable } from '@angular/core';
import { Node } from '../../models/Node'
import { Connection, TConnection } from '../../models/Connection';
import { Selectable } from '../../models/Selectable';
import { Subject } from 'rxjs';
import Room from '../../models/Room';
import { Pin } from '../../models/Pin';

export type TObjectServiceUpdate = {
  nodes: Room[],
  connections: Connection[]
}

@Injectable({
  providedIn: 'root'
})
export class ObjectsService {

  public UpdateSubject: Subject<TObjectServiceUpdate> = new Subject();
  public SelectionSubject: Subject<Room | null> = new Subject();

  public nodes: Room[] = [];
  public connections: Connection[] = [];
  public selectedElements: Selectable[] = [];
  public draggingConnection: Connection | null = null;

  public get seletableElements(): Selectable[] {
    return [...this.nodes, ...this.connections];
  }

  constructor() { }

  public add(element: Selectable) {
    if (element instanceof Room) {
      this.nodes.push(element);
    } else if (element instanceof Connection) {
      this.connections.push(element);
    }
    this.emitChanges();
  }

  public addMultipleNodes(nodes: Node[]) {
    nodes.forEach((e: Selectable) => this.add(e));
  }

  public addMultipleConnections(connections: TConnection[]) {
    connections.forEach((c: any) => {
      const { from, to } = this.getPinsFromConnections(this.nodes, c.from, c.to);
      if (from && to) {
        const connection = new Connection(from, c.id);
        connection.to = to;
        this.add(connection);
      }
    });
  }

  public select(selection: Selectable[]) {
    this.nodes.forEach(n => n.deselect());
    this.connections.forEach(c => c.deselect());
    this.selectedElements = selection;
    this.selectedElements.forEach(n => n.select());
    if (selection.length === 1 && selection[0] instanceof Room) {
      this.SelectionSubject.next(selection[0]);
    }
  }

  public deselectAll() {
    this.nodes.forEach(n => n.deselect());
    this.connections.forEach(c => c.deselect());
    this.selectedElements = [];
    this.SelectionSubject.next(null);
  }

  public selectAll() {
    this.nodes.forEach(n => n.select());
    this.connections.forEach(c => c.select());
    this.selectedElements = this.nodes;
    this.SelectionSubject.next(null);
  }
  public delete(objects: Selectable[]) {
    // remove objects
    objects.forEach(o => {
      if (o instanceof Room) {
        this.removeNode(o);
      } else if (o instanceof Connection) {
        this.removeConnection(o);
      }
    });
    // make sure nodes are still existing for connections. Else remove connections
    this.updateConnections();
    this.deselectAll();
    this.emitChanges();
  }

  public removeNode(node: Room) {
    const index = this.nodes.indexOf(node);
    if (index > -1) {
      const connections: Connection[] = [];
      node.pins.forEach(p => {
        const connection = this.connections.find(c => c.from.id === p.id || c.to?.id === p.id)
        if (connection) {
          connections.push(connection);
        }
      });
      connections.forEach(c => this.removeConnection(c));
      this.nodes.splice(index, 1);
    }
  }

  public removeConnection(connection: Connection) {
    connection.from.hasConnection = false;
    if (connection.to) {
      connection.to.hasConnection = false;
    }
    const index = this.connections.indexOf(connection);
    if (index > -1) {
      this.connections.splice(index, 1);
    }
  }

  public emitChanges() {
    this.UpdateSubject.next({
      nodes: this.nodes,
      connections: this.connections
    });
  }

  public clearService() {
    this.deselectAll();
    this.draggingConnection = null;
    this.delete([...this.nodes,...this.connections]);
  }

  private updateConnections() {
    this.connections.forEach((c) => {
      const relatedIds = [c.from.relatedId];
      if (c.to) {
        relatedIds.push(c.to.relatedId);
      }
      if (this.findMissingIds(relatedIds).length > 0) {
        this.removeConnection(c);
      }
    });
  }

  private findMissingIds(relatedIds: string[]): string[] {
    const nodeIds = new Set(this.nodes.map(node => node.id));
    return relatedIds.filter(id => !nodeIds.has(id));
  }

private getPinsFromConnections(nodes: Node[], fromId: string, toId: string): { from: Pin | null, to: Pin | null } {
    const from = this.findPinById(nodes, fromId);
    const to = this.findPinById(nodes, toId);

    return { from, to };
  }

  private findPinById(nodes: Node[], pinId: string): Pin | null {
    // Iterate through the nodes and their pins to find the pin with the matching ID
    for (const node of nodes) {
      const pin = node.pins.find((p) => p.id === pinId);
      if (pin) {
        return pin;
      }
    }
    return null; // Return undefined if no pin is found
  }

}
