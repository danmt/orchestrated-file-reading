import { ActionTypes } from './actions';

export const initialState = {
  modules: []
};

export const reducer = (state: any, action: any) => {
  switch (action.type) {
    case ActionTypes.ReadModule:
      return {
        ...state,
        modules: [
          ...state.modules,
          {
            path: action.path,
            parent: action.parent
          }
        ]
      };
    case ActionTypes.ModuleRead:
      return {
        ...state,
        modules: state.modules.map((currentModule: any) =>
          currentModule.path === action.path
            ? {
                ...currentModule,
                name: action.name
              }
            : currentModule
        )
      };
    case ActionTypes.ReadDeclarations:
      return {
        ...state,
        modules: state.modules.map((currentModule: any) =>
          currentModule.name === action.name
            ? {
                ...currentModule,
                declarations: action.declarations.map((path: string) => ({
                  path
                }))
              }
            : currentModule
        )
      };
    case ActionTypes.ReadImports:
      return {
        ...state,
        modules: state.modules.map((currentModule: any) =>
          currentModule.name === action.name
            ? {
                ...currentModule,
                imports: action.imports.map((path: string) => ({
                  path
                }))
              }
            : currentModule
        )
      };
    case ActionTypes.DeclarationRead:
      return {
        ...state,
        modules: state.modules.map((currentModule: any) =>
          currentModule.name === action.module
            ? {
                ...currentModule,
                declarations: currentModule.declarations.map(
                  (declaration: any) =>
                    declaration.path === action.path
                      ? {
                          path: action.path,
                          text: action.text,
                          name: action.name
                        }
                      : declaration
                )
              }
            : currentModule
        )
      };
    default:
      return state;
  }
};
