import { Component, ElementRef, NgZone, OnInit } from '@angular/core';
import { Vector2 } from 'three';
import { EDungeonDrawMode, StorageService } from '../../services/storage/storage.service';
import { GeneratorService, TDungeonTile } from '../../services/generator/generator.service';

@Component({
  selector: 'app-preview',
  imports: [],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss'
})
export class PreviewComponent implements OnInit {
  public canvas: HTMLCanvasElement | null = null;
  public currentDungeon: TDungeonTile[][] = [[]];

  private abortController: AbortController = new AbortController();
  private context: CanvasRenderingContext2D | null = null;
  private height: number = 0;
  private width: number = 0;
  private gridSize: number = 60;

  public constructor(
    private ref: ElementRef, 
    private storageService: StorageService, 
    private generatorService: GeneratorService, private ngZone: NgZone) {
    this.generatorService.dungeonSubject.subscribe(dungeon => this.currentDungeon = dungeon);
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
      this.drawDungeon(this.currentDungeon)
    } else {
      this.drawSimplifiedDungeon(this.currentDungeon);
    }

    requestAnimationFrame(this.renderCanavs.bind(this));
  }
  private drawSimplifiedDungeon(
    config: any[][],
  ) {
    // Define colors for room and path
    const colors: Record<string, string> = {
      room: "#8e44ad", // Purple for rooms
      path: "#3498db", // Blue for paths
    };

    const maxLengthY = config.reduce((max, subArray) => Math.max(max, subArray.length), 0) * this.gridSize;
    const maxLengthX = config.length * this.gridSize;
    const offset = new Vector2(this.width / 2 - maxLengthX / 2, this.height / 2 - maxLengthY / 2)

    // Iterate through the configuration
    config.forEach((row) => {
      row.forEach((item) => {
        const { type, w, h, pos } = item;

        // Calculate the position and dimensions in pixels
        const x = pos.x * this.gridSize + offset.x;
        const y = pos.y * this.gridSize + offset.y;
        const width = w * this.gridSize;
        const height = h * this.gridSize;

        // Set the fill color based on the type
        this.context!.fillStyle = colors[type] || "#95a5a6"; // Default to gray if type is unknown

        // Draw the rectangle
        this.context!.fillRect(x, y, width, height);

        // Optional: Draw the border for better visualization
        this.context!.strokeStyle = "#2c3e50"; // Dark gray for border
        this.context!.lineWidth = 1;
        this.context!.strokeRect(x, y, width, height);
      });
    });
  }

  private drawDungeon(
    config: any[][],
  ): void {
    const gridSize = this.gridSize;
    // Define colors for room and path
    const colors: Record<string, string> = {
      room: "#37946e", // Purple for rooms
      path: "#37946e", // Blue for paths
    };

    // Define color for connections and walls
    const connectionColor = "#37946e"; // Red for connections
    const wallColor = "#ac3232"; // Dark blue-gray for walls

    const maxLengthY = config.reduce((max, subArray) => Math.max(max, subArray.length), 0) * this.gridSize;
    const maxLengthX = config.length * this.gridSize;
    const offset = new Vector2(this.width / 2 - maxLengthX / 2, this.height / 2 - maxLengthY / 2)

    // Iterate through the configuration
    config.forEach((row) => {
      row.forEach((item) => {
        const { type, w, h, pos, connections } = item;

        // Calculate the position and dimensions in pixels
        const x = pos.x * gridSize + offset.x;
        const y = pos.y * gridSize + offset.y;

        // Set the fill color based on the type
        this.context!.fillStyle = colors[type] || "#95a5a6"; // Default to gray if type is unknown

        // Divide the rectangle into a 3x3 grid and draw each cell
        const subCellSize = gridSize / 3;
        for (let i = 0; i < w * 3; i++) {
          for (let j = 0; j < h * 3; j++) {
            const cellX = x + i * subCellSize;
            const cellY = y + j * subCellSize;

            // Check if this subcell is a connection point
            const isConnection = connections?.some((conn: any) => {
              const { dir } = conn;
              const connX =
                conn.pos.x * 3 + (dir === 1 ? 2 : dir === 3 ? 0 : 1);
              const connY =
                conn.pos.y * 3 + (dir === 0 ? 0 : dir === 2 ? 2 : 1);
              return connX === i && connY === j;
            });

            // Check if this subcell is a wall (outer edge of the grid)
            const isWall =
              i === 0 || j === 0 || i === w * 3 - 1 || j === h * 3 - 1;

            if (isConnection) {
              this.context!.fillStyle = connectionColor;
            } else if (isWall) {
              this.context!.fillStyle = wallColor;
            } else {
              this.context!.fillStyle = colors[type] || "#95a5a6";
            }

            // Fill the subcell
            this.context!.fillRect(cellX, cellY, subCellSize, subCellSize);

            // Optional: Draw the border of each subcell
            this.context!.strokeStyle = "#2c3e50"; // Dark gray for border
            this.context!.lineWidth = 1;
            this.context!.strokeRect(cellX, cellY, subCellSize, subCellSize);
          }
        }
      });
    });
  }

}
