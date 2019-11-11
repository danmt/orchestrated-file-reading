export interface Action {
  type: string;
}

export enum ActionTypes {
  Init = 'Init',
  ReadModule = 'Read Module',
  ReadDeclarations = 'Read Declarations',
  ReadImports = 'Read Imports',
  ModuleRead = 'Module Read',
  DeclarationRead = 'Declaration Read'
}

export class Init implements Action {
  type = ActionTypes.Init;
}

export class ReadModule implements Action {
  type = ActionTypes.ReadModule;
  constructor(public path: string, public parent: string) {}
}

export class ReadDeclarations implements Action {
  type = ActionTypes.ReadDeclarations;
  constructor(public name: string, public declarations: string[]) {}
}

export class ReadImports implements Action {
  type = ActionTypes.ReadImports;
  constructor(public name: string, public imports: string[]) {}
}

export class ModuleRead implements Action {
  type = ActionTypes.ModuleRead;
  constructor(public path: string, public name: string) {}
}

export class DeclarationRead implements Action {
  type = ActionTypes.DeclarationRead;
  constructor(
    public module: string,
    public name: string,
    public path: string,
    public text: string
  ) {}
}

export type ActionTypesUnion =
  | Init
  | ReadModule
  | ReadDeclarations
  | ReadImports
  | ModuleRead
  | DeclarationRead;
