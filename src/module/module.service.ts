import path from 'path';
import { arrayUpdate } from '../core/utils/common';

const pipe = (...fns: any) => (arg: any) =>
  fns.reduce((prev: any, fn: any) => fn(prev), arg);

class ModuleService {
  private markDecoratorAsLoaded(status: any) {
    return {
      ...status,
      decoratorLoaded: true,
      fullyLoaded: status.importsLoaded
    };
  }

  private markImportsAsLoaded(status: any) {
    return {
      ...status,
      importsLoaded: true,
      fullyLoaded: status.decoratorLoaded
    };
  }

  saveModuleImports(modules: any, action: any) {
    return arrayUpdate(
      modules,
      item => item.path === action.path,
      item => ({
        imports: action.imports,
        status: this.markImportsAsLoaded(item.status)
      })
    );
  }

  saveModuleDecorator(modules: any, action: any) {
    return arrayUpdate(
      modules,
      item => item.path === action.path,
      item => ({
        name: action.moduleDetails.name,
        decorator: {
          imports: action.moduleDetails.decorator.imports.map(
            (name: string) => ({ name })
          )
        },
        status: moduleService.markDecoratorAsLoaded(item.status)
      })
    );
  }

  extendModuleDecoratorImports(modules: any, action: any) {
    return pipe(
      (modules: any) =>
        modules.find((curr: any) => curr.name === action.moduleName),
      ({ decorator, path: modulePath }: any) =>
        arrayUpdate(
          decorator.imports,
          item => item.name === action.importName,
          () => ({
            path: path.join(modulePath, '..', `${action.path}.ts`)
          })
        ),
      (imports: any) =>
        arrayUpdate(
          modules,
          item => item.name === action.moduleName,
          item => ({
            decorator: {
              ...item.decorator,
              imports
            }
          })
        )
    )(modules);
  }
}

export const moduleService = new ModuleService();
