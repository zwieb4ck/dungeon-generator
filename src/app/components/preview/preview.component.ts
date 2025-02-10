import { Component, ElementRef, NgZone, OnInit } from '@angular/core';
import { Vector2 } from 'three';
import { EDungeonDrawMode, StorageService } from '../../services/storage/storage.service';
import { GeneratorService, TDungeonTile, TTileConnections } from '../../services/generator/generator.service';

@Component({
  selector: 'app-preview',
  imports: [],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss'
})
export class PreviewComponent implements OnInit {
  public canvas: HTMLCanvasElement | null = null;
  public currentDungeon: TDungeonTile[] = [];

  private abortController: AbortController = new AbortController();
  private context: CanvasRenderingContext2D | null = null;
  private height: number = 0;
  private width: number = 0;
  private gridSize: number = 60;

  public constructor(
    private ref: ElementRef, 
    private storageService: StorageService, 
    private generatorService: GeneratorService, private ngZone: NgZone) {
    this.generatorService.dungeonSubject.subscribe(dungeon => {
      this.currentDungeon = dungeon;
      console.log(this.currentDungeon);
    });
  }

  public ngOnInit(): void {
    this.canvas = this.ref.nativeElement.querySelector('#preview');
    if (this.canvas) {
      this.resizeStage();
      this.context = this.canvas.getContext("2d")!;
      
      this.ngZone.runOutsideAngular(()=>{
        this.renderCanavs();
      });
    }
    window.addEventListener('resize', this.resizeStage.bind(this), { signal: this.abortController.signal });
  }

  public ngOnDestroy() {
    this.abortController.abort();
  }
  private resizeStage() {
    if (this.canvas === null) return;
    this.height = this.ref.nativeElement.clientHeight;
    this.width = this.ref.nativeElement.clientWidth;
    this.canvas.height = this.height;
    this.canvas.width = this.width;
  }

  private renderCanavs() {
    if (this.context === null || this.currentDungeon.length === 0) return;
    this.context.clearRect(0, 0, this.width, this.height);

    if (this.storageService.currentProject?.drawMode === EDungeonDrawMode.Complex) {
      this.drawDungeon(this.currentDungeon);
    } else {
      this.drawSimplifiedDungeon(this.currentDungeon);
    }

    requestAnimationFrame(this.renderCanavs.bind(this));
  }

  private drawSimplifiedDungeon(rooms: any[]) {
    // Define colors for room and path
    const colors: Record<number, string> = {
      0: "#8e44ad", // Purple for rooms
      1: "#3498db", // Blue for paths
    };
  
    // Berechnung der Gesamtgröße des Dungeons für zentrierte Darstellung
    const minX = Math.min(...rooms.map(room => room.pos.x));
    const minY = Math.min(...rooms.map(room => room.pos.y));
    const maxX = Math.max(...rooms.map(room => room.pos.x + room.w));
    const maxY = Math.max(...rooms.map(room => room.pos.y + room.h));
  
    const dungeonWidth = (maxX - minX) * this.gridSize;
    const dungeonHeight = (maxY - minY) * this.gridSize;
    const offset = new Vector2(this.width / 2 - dungeonWidth / 2, this.height / 2 - dungeonHeight / 2);
  
    // Zeichne alle Räume
    rooms.forEach(room => {
      const { type, w, h, pos } = room;
  
      // Berechne Position in Pixel
      const x = (pos.x - minX) * this.gridSize + offset.x;
      const y = (pos.y - minY) * this.gridSize + offset.y;
      const width = w * this.gridSize;
      const height = h * this.gridSize;
  
      // Raum zeichnen
      this.context!.fillStyle = colors[type] || "#95a5a6"; // Standardfarbe falls unbekannt
      this.context!.fillRect(x, y, width, height);
  
      // Rahmen zeichnen
      this.context!.strokeStyle = "#2c3e50";
      this.context!.lineWidth = 1;
      this.context!.strokeRect(x, y, width, height);
  
      // Verbindungen zeichnen (optional)
      room.connections.forEach((connection: TTileConnections) => {
        const connX = (connection.pos.x - minX) * this.gridSize + offset.x + this.gridSize / 2;
        const connY = (connection.pos.y - minY) * this.gridSize + offset.y + this.gridSize / 2;
  
        this.context!.strokeStyle = "#e74c3c"; // Rote Linien für Verbindungen
        this.context!.beginPath();
        this.context!.moveTo(x + width / 2, y + height / 2);
        this.context!.lineTo(connX, connY);
        this.context!.stroke();
      });
    });
  }

  private drawDungeon(rooms: any[]): void {
    const gridSize = this.gridSize;
    
    // Farben für Räume, Pfade, Verbindungen und Wände definieren
    const colors: Record<number, string> = {
      0: "#37946e", // Grün für Räume
      1: "#37946e", // Grün für Pfade
    };
    const connectionColor = "#ac3232"; // Rot für Verbindungen
    const wallColor = "#2c3e50"; // Dunkles Blau für Wände
  
    // Berechnung der Dungeon-Grenzen für eine zentrierte Darstellung
    const minX = Math.min(...rooms.map(room => room.pos.x));
    const minY = Math.min(...rooms.map(room => room.pos.y));
    const maxX = Math.max(...rooms.map(room => room.pos.x + room.w));
    const maxY = Math.max(...rooms.map(room => room.pos.y + room.h));
  
    const dungeonWidth = (maxX - minX) * gridSize;
    const dungeonHeight = (maxY - minY) * gridSize;
    const offset = new Vector2(this.width / 2 - dungeonWidth / 2, this.height / 2 - dungeonHeight / 2);
  
    // Zeichne jeden Raum
    rooms.forEach(room => {
      const { type, w, h, pos, connections } = room;
  
      // Berechnung der Raumposition in Pixeln
      const x = (pos.x - minX) * gridSize + offset.x;
      const y = (pos.y - minY) * gridSize + offset.y;
      
      // Aufteilung in 3x3 Subzellen pro Grid-Zelle
      const subCellSize = gridSize / 3;
  
      for (let i = 0; i < w * 3; i++) {
        for (let j = 0; j < h * 3; j++) {
          const cellX = x + i * subCellSize;
          const cellY = y + j * subCellSize;
  
          // Prüfen, ob diese Subzelle eine Verbindung ist
          const isConnection = connections?.some((conn: any) => {
            const { dir } = conn;
            const connX = conn.pos.x * 3 + (dir === 1 ? 2 : dir === 3 ? 0 : 1);
            const connY = conn.pos.y * 3 + (dir === 0 ? 0 : dir === 2 ? 2 : 1);
            return connX === i && connY === j;
          });
  
          // Prüfen, ob diese Subzelle eine Wand ist (äußere Begrenzung)
          const isWall = i === 0 || j === 0 || i === w * 3 - 1 || j === h * 3 - 1;
  
          if (isConnection) {
            this.context!.fillStyle = connectionColor;
          } else if (isWall) {
            this.context!.fillStyle = wallColor;
          } else {
            this.context!.fillStyle = colors[type] || "#95a5a6"; // Standardfarbe falls unbekannt
          }
  
          // Subzelle füllen
          this.context!.fillRect(cellX, cellY, subCellSize, subCellSize);
  
          // Optional: Gitterlinien für Subzellen zeichnen
          this.context!.strokeStyle = "#2c3e50"; // Dunkelgrau für Linien
          this.context!.lineWidth = 1;
          this.context!.strokeRect(cellX, cellY, subCellSize, subCellSize);
        }
      }
    });
  }
  
}
