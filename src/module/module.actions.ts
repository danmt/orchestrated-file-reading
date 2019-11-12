import { Action } from '../core/state/actions';

export enum ActionTypes {
  SaveModuleDecorator = '[Module] Save Module Decorator',
  SaveModuleImports = '[Module] Save Module Imports'
}

export class SaveModuleDecorator implements Action {
  type = ActionTypes.SaveModuleDecorator;
  constructor(public moduleDecorator: any) {}
}

export class SaveModuleImports implements Action {
  type = ActionTypes.SaveModuleImports;
  constructor(public moduleImports: any) {}
}

export type ActionTypesUnion = SaveModuleDecorator | SaveModuleImports;
