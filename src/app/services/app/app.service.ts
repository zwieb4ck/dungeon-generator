import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private editorPositionResetAction = new Subject<void>();

  public editorPositionResetAction$ = this.editorPositionResetAction.asObservable();

  constructor() { }

  public triggerEditorAction() {
    this.editorPositionResetAction.next();
  }
}
