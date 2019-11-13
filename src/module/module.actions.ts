import { Action } from '../core/state/actions';

export enum ActionTypes {
  SaveModuleDecorator = '[Module] Save Module Decorator',
  SaveModuleImports = '[Module] Save Module Imports',
  MarkModuleAsLoaded = '[Module] Mark Module as Loaded',
  ExtendModuleDecoratorImports = '[Module] Extend Module Decorator Imports'
}

export class SaveModuleDecorator implements Action {
  type = ActionTypes.SaveModuleDecorator;
  constructor(public path: string, public moduleDetails: any) {}
}

export class SaveModuleImports implements Action {
  type = ActionTypes.SaveModuleImports;
  constructor(public path: string, public imports: any) {}
}

export class MarkModuleAsLoaded implements Action {
  type = ActionTypes.MarkModuleAsLoaded;
  constructor(public path: string) {}
}

export class ExtendModuleDecoratorImports implements Action {
  type = ActionTypes.ExtendModuleDecoratorImports;
  constructor(
    public moduleName: string,
    public importName: string,
    public path: any
  ) {}
}

export type ActionTypesUnion =
  | SaveModuleDecorator
  | SaveModuleImports
  | MarkModuleAsLoaded
  | ExtendModuleDecoratorImports;
