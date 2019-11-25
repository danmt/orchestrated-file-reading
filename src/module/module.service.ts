import path from 'path';
import { arrayUpdate } from '../core/utils/common';
import { ModuleStatus } from './models/module-status.model';
import { Module } from './models/module.model';
import { ModuleDecorator } from './models/module-decorator.model';

const pipe = (...fns: any) => (arg: any) =>
  fns.reduce((prev: any, fn: any) => fn(prev), arg);

class ModuleService {
  private markDecoratorAsLoaded(status: ModuleStatus) {
    return {
      ...status,
      decoratorLoaded: true,
      fullyLoaded: status.importsLoaded
    };
  }

  private markImportsAsLoaded(status: ModuleStatus) {
    return {
      ...status,
      importsLoaded: true,
      fullyLoaded: status.decoratorLoaded
    };
  }

  saveModuleImports(modules: Module[], action: any) {
    return arrayUpdate(
      modules,
      (item: Module) => item.path === action.path,
      (item: Module) => ({
        imports: action.imports,
        status: this.markImportsAsLoaded(item.status)
      })
    );
  }

  saveModuleDecorator(modules: Module[], action: any) {
    return arrayUpdate(
      modules,
      (item: Module) => item.path === action.path,
      (item: Module) => ({
        name: action.moduleDetails.name,
        decorator: new ModuleDecorator(
          action.moduleDetails.decorator.imports.map((name: string) => ({
            name
          }))
        ),
        status: moduleService.markDecoratorAsLoaded(item.status)
      })
    );
  }

  extendModuleDecoratorImports(modules: Module[], action: any) {
    return pipe(
      (modules: Module[]) =>
        modules.find((curr: Module) => curr.name === action.moduleName),
      ({ decorator, path: modulePath }: Module) =>
        arrayUpdate(
          (decorator && decorator.imports) || [],
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
