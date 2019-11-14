export interface Action {
  type: string;
}

export enum ActionTypes {
  Init = 'Init'
}

export class Init implements Action {
  type = ActionTypes.Init;
}

export type ActionTypesUnion =
  | Init;
