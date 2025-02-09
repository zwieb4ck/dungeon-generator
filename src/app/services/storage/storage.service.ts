import { Injectable } from '@angular/core';
import { MathUtils } from 'three';
import { ObjectsService } from '../objects/objects.service';
import { Node, TNode } from '../../models/Node';
import { Connection, TConnection } from '../../models/Connection';
import { Pin } from '../../models/Pin';
import NodeFactory from '../../factories/Node.factory';
import { generateSeed } from '../../utils/generateSeed';
import { NotificationService } from '../notification/notification.service';
import { ENotificationType } from '../../models/Notification';

export enum EDungeonDrawMode {
  Simple,
  Complex,
}

export type Project = {
  name: string;
  id: string;
  seed: string;
  drawMode: EDungeonDrawMode;
  nodes: Node[];
  connections: Connection[];
}

export type TProject = {
  name: string;
  id: string;
  seed: string;
  drawMode: EDungeonDrawMode;
  nodes: TNode[];
  connections: TConnection[];
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public projects: TProject[] = []

  public currentProject: TProject | null = null;

  public getDefaultProject() {
    return {
      ...{
        name: 'New Project',
        id: MathUtils.generateUUID(),
        seed: generateSeed(),
        drawMode: EDungeonDrawMode.Simple,
        nodes: [],
        connections: [],
      }
    }
  }

  constructor(private objectService: ObjectsService, private notificationService: NotificationService) {
    this.projects = JSON.parse(window.localStorage.getItem('projects') || "[]");
    if (this.projects.length === 0) {
      this.createNewProject();
    } else {
      this.loadProject(this.projects[this.projects.length - 1]);
    }
  }

  public createNewProject() {
    const newProject = this.getDefaultProject();
    this.projects.push(newProject);
    this.loadProject(newProject);
  }

  public loadProject(project: TProject) {
    this.objectService.clearService();
    const nodes = project.nodes.map(n => NodeFactory.createFromJson(n));
    this.objectService.addMultipleNodes(nodes);
    this.objectService.addMultipleConnections(project.connections);
    this.currentProject = project;
  }

  public saveProject() {
    if (this.currentProject === null) {
      this.notificationService.sendNotification('Could not save Project', ENotificationType.Error);
      return;
    };
    this.currentProject.nodes = this.objectService.nodes.map(n => n.toJson());
    this.currentProject.connections = this.objectService.connections.map(c => c.toJson());
    const index = this.projects.findIndex(p => p.id === this.currentProject!.id);
    if (index > -1) {
      this.projects[index] = this.currentProject;
      window.localStorage.setItem('projects', JSON.stringify(this.projects));
    }
    this.notificationService.sendNotification('Project saved!', ENotificationType.Success);
  }

  public applyNewSeedToCurrentProject() {
    if (this.currentProject === null) return;
    const seed = generateSeed();
    this.currentProject.seed = seed;
  }
}
