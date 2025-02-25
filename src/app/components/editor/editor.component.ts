import { Component, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MathUtils, Vector2 } from 'three';
import { EditorContextmenuComponent } from "./editor-contextmenu/editor-contextmenu.component";
import { CommonModule } from '@angular/common';
import { ObjectsService } from '../../services/objects/objects.service';
import { AppService } from '../../services/app/app.service';
import { Marquee } from '../../models/Marquee';
import { StorageService } from '../../services/storage/storage.service';
import { ENodeType, Node, NodeConfig, TNode } from '../../models/Node';
import { ENodeClickTarget } from '../../enums/NodeClickTarget';
import { Connection } from '../../models/Connection';
import { EPinType, Pin } from '../../models/Pin';
import NodeFactory from '../../factories/Node.factory';

const EditorSettings = {
  gridSize: 50,
  gridColor: '#ffffff',
  gridWidth: 1,
  gridOpacity: 0.2
}

@Component({
  selector: 'app-editor',
  imports: [EditorContextmenuComponent, CommonModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit, OnDestroy {
  //#region Public Properties
  public canvas: HTMLCanvasElement | null = null;
  public contextMenuOpen: boolean = false;
  public nodes: Node[] = [];
  public clickedOnNode: boolean = false;
  public currentClickPoint: Vector2 = new Vector2(0, 0);
  public clickedOnPin: boolean = false;
  public clickedOnAdd: boolean = false;
  public dragConnectionActive: boolean = false;

  //#endregion
  //#region Private Properties
  private abortController: AbortController = new AbortController();
  private context: CanvasRenderingContext2D | null = null;
  private height: number = 0;
  private width: number = 0;
  private isMapDragging: boolean = false;
  private currentButtonPressed: number = -1;
  private canvasOffset: Vector2 = new Vector2(0, 0);

  private isMarqueeDrawing: boolean = false;
  private marqueeEnd: Vector2 = new Vector2(0, 0);

  private zoomFactor: number = 1;

  private get clickPointWorld(): Vector2 {
    return new Vector2(
      this.currentClickPoint.x + this.canvasOffset.x,
      this.currentClickPoint.y + this.canvasOffset.y
    );
  }
  //#endregion
  constructor(
    public ref: ElementRef,
    public objectService: ObjectsService,
    public appService: AppService,
    public storageService: StorageService,
    private ngZone: NgZone,
  ) { }
  //#region Lifecycle Hooks
  ngOnInit() {
    this.canvas = this.ref.nativeElement.querySelector('#editor');
    if (this.canvas) {
      this.resizeStage();
      this.context = this.canvas.getContext("2d")!;
      if (this.objectService.nodes.length === 0) {
        const newNode = this.createNode(ENodeType.Entry, new Vector2(this.width / 2 - NodeConfig.defaultWidth / 2, this.height / 2 - NodeConfig.defaultHeight / 2));
        this.objectService.updateStartNode(newNode);
      }
      this.ngZone.runOutsideAngular(() => {
        this.renderCanavs();
      });
      // eventlisteners
      this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this), { signal: this.abortController.signal });
      this.canvas.addEventListener('wheel', this.handleMouseScroll.bind(this), { signal: this.abortController.signal });
      window.addEventListener('mousemove', this.handleMouseMove.bind(this), { signal: this.abortController.signal });
      window.addEventListener('mouseup', this.handleMouseUp.bind(this), { signal: this.abortController.signal });
      window.addEventListener('keydown', this.handleKeyDown.bind(this), { signal: this.abortController.signal });
      window.addEventListener('contextmenu', e => e.preventDefault(), { signal: this.abortController.signal });
      window.addEventListener('resize', this.resizeStage.bind(this), { signal: this.abortController.signal });

      // subscriptions
      this.appService.editorPositionResetAction$.subscribe(() => {
        this.canvasOffset = new Vector2(0, 0);
      });

      this.objectService.emitChanges();
      setTimeout(() => {
        this.objectService.emitChanges();
      }, 0);
    }
  }

  ngOnDestroy() {
    this.abortController.abort();
  }
  //#endregion
  //#region Canvas Handling
  private resizeStage() {
    if (this.canvas === null) return;
    this.height = this.ref.nativeElement.clientHeight;
    this.width = this.ref.nativeElement.clientWidth;
    this.canvas.height = this.height;
    this.canvas.width = this.width;
  }

  private renderCanavs() {
    if (this.context === null) return;
    this.context.clearRect(0, 0, this.width, this.height);
    this.drawGrid();
    this.drawNodes();
    this.drawConnections();
    this.drawDebug();
    this.drawMarquee();
    requestAnimationFrame(this.renderCanavs.bind(this));
  }

  private drawGrid() {
    if (this.context === null) return;

    const gridSize = EditorSettings.gridSize * this.zoomFactor; // Skalierung der Grid-Größe

    this.context.strokeStyle = EditorSettings.gridColor;
    this.context.lineWidth = EditorSettings.gridWidth * this.zoomFactor; // Skalierung der Linienbreite
    this.context.globalAlpha = EditorSettings.gridOpacity;

    const offsetX = this.canvasOffset.x % gridSize;
    const offsetY = this.canvasOffset.y % gridSize;

    for (let x = 0 - offsetX; x < this.width; x += gridSize) {
      this.context.beginPath();
      this.context.moveTo(x, 0);
      this.context.lineTo(x, this.height);
      this.context.stroke();
    }
    for (let y = 0 - offsetY; y < this.height; y += gridSize) {
      this.context.beginPath();
      this.context.moveTo(0, y);
      this.context.lineTo(this.width, y);
      this.context.stroke();
    }

    this.context.globalAlpha = 1;
  }

  private drawNodes() {
    this.objectService.nodes.forEach(node => {
      const scaledPosition = new Vector2(
        (node.position.x - this.canvasOffset.x) * this.zoomFactor,
        (node.position.y - this.canvasOffset.y) * this.zoomFactor
      );

      node.DrawNode(this.context!, scaledPosition, this.zoomFactor);
    });
  }

  private drawConnections() {
    this.objectService.connections.forEach((c) => {
      if (c.to === null && this.context !== null) {
        c.drawLine(this.context, this.currentMousePos);
      } else if (this.context !== null) {
        c.drawLine(this.context);
      }
    })
  }


  public drawMarquee() {
    if (this.context === null || !this.isMarqueeDrawing) return;
    const topX = Math.min(this.currentClickPoint.x, this.marqueeEnd.x);
    const topY = Math.min(this.currentClickPoint.y, this.marqueeEnd.y);
    const bottomX = Math.max(this.currentClickPoint.x, this.marqueeEnd.x);
    const bottomY = Math.max(this.currentClickPoint.y, this.marqueeEnd.y);

    const topLeft = new Vector2(topX, topY);
    const bottomRight = new Vector2(bottomX, bottomY);

    const nodesInRectangle = Marquee.getNodesInRectangle(this.objectService.seletableElements, topLeft, bottomRight);
    Marquee.drawRectangle(this.context, this.currentClickPoint, this.marqueeEnd);
    this.objectService.select(nodesInRectangle);
  }

  private drawDebug() {
    if (this.context === null) return;
  }
  //#endregion
  //#region mouse click
  handleMouseDown(event: MouseEvent) {
    this.currentClickPoint = new Vector2(event.offsetX, event.offsetY);
    this.contextMenuOpen = false;
    this.currentButtonPressed = event.button;
    switch (event.button) {
      case 0:
        const selectedNode = this.objectService.nodes.filter(n => n.isNodeAtPoint(this.currentClickPoint)).reverse()[0];
        const selectedConnection = this.objectService.connections.filter(c => c.isConnectionAtPoint(this.currentClickPoint)).reverse()[0];
        if (selectedNode) {
          if (!this.objectService.selectedElements.includes(selectedNode)) {
            this.objectService.select([selectedNode]);
          }
          const clickResult = selectedNode.getClickedCollision(this.currentClickPoint);
          switch (clickResult.type) {
            case ENodeClickTarget.InPin:
            case ENodeClickTarget.OutPin:
              const target = clickResult.target as Pin;
              this.clickedOnPin = true;
              if (target.hasConnection) {
              } else {
                if (this.dragConnectionActive) {
                  const from = this.objectService.draggingConnection?.from;
                  if (from && from.type !== target.type && from.relatedId !== target.relatedId) {
                    this.createConnection(target);
                  }
                } else {
                  this.startConnection(target);
                }
              }
              break;
            case ENodeClickTarget.Node:
              if (this.dragConnectionActive) {
                const target = clickResult.target as Node;
                const from = this.objectService.draggingConnection?.from;
                if (from && from.relatedId !== target.id) {
                  const firstFreePin = target.pins.filter(p => p.type !== from.type && !p.hasConnection)[0];
                  let pin;
                  if (firstFreePin) {
                    pin = firstFreePin;
                  } else {
                    pin = from.type === EPinType.In ? target.addOutPin() : target.addInPin();
                  }
                  this.createConnection(pin);
                }
              } else {
                this.clickedOnNode = true;
              }
              break;
            case ENodeClickTarget.AddButton:
              this.clickedOnAdd = true;
              selectedNode.addOutPin();
              break;
          }
        } else if (selectedConnection) {
          this.objectService.select([selectedConnection]);
        } else {
          this.objectService.deselectAll();
        }
        return;
      case 2:
        this.contextMenuOpen = true;
        return;
      case 1:
        this.isMapDragging = true;
        return;

    }
  }
  public currentMousePos: Vector2 = new Vector2(0, 0);
  handleMouseMove(event: MouseEvent) {
    // Calculate relative mouse position manually
    const canvasRect = this.canvas?.getBoundingClientRect()!;
    const relativeX = event.clientX - canvasRect.left;
    const relativeY = event.clientY - canvasRect.top;
    this.currentMousePos = new Vector2(relativeX, relativeY);
    if (this.currentButtonPressed < 0) {
      return;
    }
    switch (this.currentButtonPressed) {
      case 0:
        if (this.objectService.selectedElements.length > 0 && !this.isMarqueeDrawing && this.clickedOnNode) {
          const distanceVector = new Vector2(event.movementX, event.movementY);
          this.objectService.getAllSelectedNodes().forEach(node => {
            node.position.add(distanceVector);
          });
        } else if (!this.clickedOnNode && !this.clickedOnAdd && !this.clickedOnPin && !this.dragConnectionActive) {
          const clampedX = Math.max(0, Math.min(this.width, relativeX));
          const clampedY = Math.max(0, Math.min(this.height, relativeY));
          this.isMarqueeDrawing = true;
          this.marqueeEnd = new Vector2(clampedX, clampedY);
        }
        break;
      case 1:
        if (this.isMapDragging) {
          this.handleMapMove(event);
        }
        break;
      case 2:
    }
  }

  handleMouseUp() {
    this.currentButtonPressed = -1;
    this.isMapDragging = false;
    this.isMarqueeDrawing = false;
    this.clickedOnNode = false;
    this.clickedOnPin = false;
    this.clickedOnAdd = false;
    this.objectService.emitChanges();
  }
  //#endregion
  //#region Mouse scroll
  handleMouseScroll(event: WheelEvent) {
    if (this.canvas === null) return;
    if (event.deltaY > 0) {
      this.zoomFactor = MathUtils.clamp(this.zoomFactor - 0.1, 0.1, 1);
    } else {
      this.zoomFactor = MathUtils.clamp(this.zoomFactor + 0.1, 0.1, 1);
    }
  }
  //#endregion
  //#region keyboard
  handleKeyDown(event: KeyboardEvent) {
    let middle: Vector2 = new Vector2(0, 0);
    const ignoreTragets = ['input', 'textarea'];
    if (ignoreTragets.includes((event.target as HTMLElement).tagName.toLowerCase())) return;
    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        this.objectService.delete(this.objectService.selectedElements);
        break
      case 'x':
        if (event.ctrlKey || event.metaKey) {
          this.objectService.nodes = this.objectService.nodes.filter(n => !this.objectService.selectedElements.includes(n));
          this.objectService.selectedElements = [];
        }
        break;
      case 'Escape':
        if (this.dragConnectionActive && this.objectService.draggingConnection) {
          this.objectService.delete([this.objectService.draggingConnection]);
        } else {
          this.objectService.deselectAll();
        }
        break;
      case 'c':
        if (event.ctrlKey || event.metaKey) {
          const nodes = this.objectService.getAllSelectedNodes().map(node => node.toJson());
          nodes.forEach(node => node.position = { x: node.position.x + 10, y: node.position.y + 10 })
          navigator.clipboard.writeText(JSON.stringify(nodes));
        }
        break;
      case 'v':
        if (event.ctrlKey || event.metaKey) {
          navigator.clipboard.readText().then(text => {
            const nodes = JSON.parse(text) as TNode[];
            if (nodes.length > 0) {
              this.objectService.deselectAll();
            }
            let newNodes: Node[] = []
            nodes.forEach((node: any) => {
              const newNode = NodeFactory.create(node.type, new Vector2(node.position.x, node.position.y));
              newNodes.push(newNode);

              this.objectService.add(newNode);
            });
            this.objectService.select(newNodes);
            nodes.forEach(node => node.position = { x: node.position.x + 10, y: node.position.y + 10 })
            navigator.clipboard.writeText(JSON.stringify(nodes));
          });
        }
        break;
      case 'd':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const newNodes: Node[] = [];
          this.objectService.getAllSelectedNodes().forEach((node: Node) => {
            const newNode = NodeFactory.create(node.type, new Vector2(node.position.x, node.position.y));
            this.objectService.add(newNode);
            newNodes.push(newNode);
          });
          this.objectService.deselectAll();
          this.objectService.select(newNodes);
        }
        break;
      case 'ArrowUp':
        this.objectService.getAllSelectedNodes().forEach(node => {
          node.position.y -= 10;
        });
        break;
      case 'ArrowDown':
        this.objectService.getAllSelectedNodes().forEach(node => {
          node.position.y += 10;
        });
        break;
      case 'ArrowLeft':
        this.objectService.getAllSelectedNodes().forEach(node => {
          node.position.x -= 10;
        });
        break;
      case 'ArrowRight':
        this.objectService.getAllSelectedNodes().forEach(node => {
          node.position.x += 10;
        });
        break;
      case 'q':
        middle = this.objectService.getAllSelectedNodes().reduce((acc, node) => acc.add(node.position), new Vector2(0, 0)).divideScalar(this.objectService.selectedElements.length);
        this.objectService.getAllSelectedNodes().forEach(node => {
          node.position.y = middle.y;
        });
        break;
      case 'a':
        if (event.ctrlKey || event.metaKey) {
          middle = this.objectService.getAllSelectedNodes().reduce((acc, node) => acc.add(node.position), new Vector2(0, 0)).divideScalar(this.objectService.selectedElements.length);
          this.objectService.getAllSelectedNodes().forEach(node => {
            node.position.x = middle.x;
          });
        } else {
          this.objectService.selectAll();
        }
        break;
      case 's':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.storageService.saveProject();
        }
        break;
    }
  }
  //#endregion
  //#region MapMove
  handleMapMove(event: MouseEvent) {
    const distanceVector = new Vector2(event.movementX, event.movementY);
    this.canvasOffset.sub(distanceVector);
  }
  //#endregion
  //#region Nodes
  createNode(nodeType: ENodeType, position: Vector2 = this.clickPointWorld) {
    this.contextMenuOpen = false;
    const newNode = NodeFactory.create(nodeType, position)
    this.objectService.add(newNode);
    return newNode;
  }
  //#endregion
  //#region Connections
  public createConnection(to: Pin) {
    this.dragConnectionActive = false;
    if (this.objectService.draggingConnection !== null) {
      this.objectService.draggingConnection.setTarget(to);
      this.objectService.draggingConnection = null;
      to.hasConnection = true;
    }
  }

  public startConnection(from: Pin) {
    this.dragConnectionActive = true;
    const newConnection = new Connection(from);
    this.objectService.add(newConnection);
    this.objectService.draggingConnection = newConnection;
    from.hasConnection = true;
  }
  //#endregion
}
