import * as ModuleActions from './module.actions';
import path from 'path';

export const reducer = (state: any, action: any) => {
  switch (action.type) {
    case ModuleActions.ActionTypes.ReadModule:
      return {
        ...state,
        modules: [
          ...state.modules,
          {
            status: {
              decoratorLoaded: false,
              importsLoaded: false,
              fullyLoaded: false
            },
            path: action.path,
            parent: action.parent
          }
        ]
      };

    case ModuleActions.ActionTypes.SaveModuleDecorator:
      return {
        ...state,
        modules: state.modules.map((currentModule: any) =>
          currentModule.path === action.path
            ? {
                ...currentModule,
                name: action.moduleDetails.name,
                decorator: {
                  imports: action.moduleDetails.decorator.imports.map(
                    (name: string) => ({ name })
                  )
                },
                status: {
                  ...currentModule.status,
                  decoratorLoaded: true,
                  fullyLoaded: currentModule.status.importsLoaded
                }
              }
            : currentModule
        )
      };

    case ModuleActions.ActionTypes.SaveModuleImports:
      return {
        ...state,
        modules: state.modules.map((currentModule: any) =>
          currentModule.path === action.path
            ? {
                ...currentModule,
                imports: action.imports,
                status: {
                  ...currentModule.status,
                  importsLoaded: true,
                  fullyLoaded: currentModule.status.decoratorLoaded
                }
              }
            : currentModule
        )
      };

    case ModuleActions.ActionTypes.ExtendModuleDecoratorImports:
      return {
        ...state,
        modules: state.modules.map((currentModule: any) =>
          currentModule.name === action.moduleName
            ? {
                ...currentModule,
                decorator: {
                  ...currentModule.decorator,
                  imports: currentModule.decorator.imports.map(
                    (currentImport: any) =>
                      currentImport.name === action.importName
                        ? {
                            ...currentImport,
                            path: path.join(
                              currentModule.path,
                              '..',
                              `${action.path}.ts`
                            )
                          }
                        : currentImport
                  )
                }
              }
            : currentModule
        )
      };

    default:
      return state;
  }
};
