import { Component } from '@angular/core';
import { IconButtonComponent } from "../shared/icon-button/icon-button.component";
import { FormsModule } from '@angular/forms';
import { EDungeonDrawMode, StorageService, TProject } from '../../services/storage/storage.service';
import { CommonModule } from '@angular/common';
import { AppService } from '../../services/app/app.service';


@Component({
  selector: 'app-header',
  imports: [IconButtonComponent, FormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(private storeService: StorageService, private appService: AppService) { }

  public get EDungeonDrawMode() {
    return EDungeonDrawMode;
  }
  public get project (): TProject {
    return this.storeService.currentProject || this.storeService.getDefaultProject();
  }

  public toggleDungeonDrawMode() {
    this.project.drawMode = this.project.drawMode === EDungeonDrawMode.Simple ? EDungeonDrawMode.Complex : EDungeonDrawMode.Simple;
  }

  public saveProject() {
    this.storeService.saveProject();
  }

  public generateNewSeed() {
    this.storeService.applyNewSeedToCurrentProject();
  }

  public editorToCenter() {
    this.appService.triggerEditorAction();
  }

}
