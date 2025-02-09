export enum ENotificationType {
    Info,
    Success,
    Warn,
    Error,
}

export class Notification {
    constructor(public message: string, public type: ENotificationType, public isVisible: boolean = true) {}
  }
  