import * as Actions from '../core/state/actions';
import * as ModuleActions from './module.actions';
import { Observable } from 'rxjs';
import { filter, map, mergeMap, withLatestFrom, tap } from 'rxjs/operators';
import { readFileAndGetAST$ } from '../core/utils/read-file';
import { getImports, getClasses } from '../core/utils/compiler';
import importPipe from '../shared/pipes/import.pipe';
import modulePipe from '../shared/pipes/module.pipe';
import { store$ } from '../core/state';
import classPipe from '../shared/pipes/class.pipe';

export class Effects {
  constructor(
    public actions$: Observable<
      ModuleActions.ActionTypesUnion | Actions.ActionTypesUnion
    >
  ) {}

  readModuleDecorator$ = this.actions$.pipe(
    filter(({ type }) => type === Actions.ActionTypes.ReadModule),
    map(action => action as Actions.ReadModule),
    mergeMap(({ path: filePath }: Actions.ReadModule) =>
      readFileAndGetAST$(filePath).pipe(
        map(sourceFile => ({
          ...getClasses(sourceFile)
            .map((node: any) => classPipe.transform(node))
            .reduce((_: any, current: any) => current),
          decorator: getClasses(sourceFile)
            .map((node: any) => modulePipe.transform(node))
            .reduce((_: any, current: any) => current)
        })),
        map(
          (moduleDecorator: any) =>
            new ModuleActions.SaveModuleDecorator(filePath, moduleDecorator)
        )
      )
    )
  );

  readModuleImports$ = this.actions$.pipe(
    filter(({ type }) => type === Actions.ActionTypes.ReadModule),
    map(action => action as Actions.ReadModule),
    mergeMap(({ path: filePath }: Actions.ReadModule) =>
      readFileAndGetAST$(filePath).pipe(
        map(sourceFile =>
          getImports(sourceFile).map((statement: any) =>
            importPipe.transform(statement)
          )
        ),
        map(
          (moduleImports: any) =>
            new ModuleActions.SaveModuleImports(filePath, moduleImports)
        )
      )
    )
  );

  loadingOver$ = this.actions$.pipe(
    filter(
      ({ type }) =>
        type === ModuleActions.ActionTypes.SaveModuleDecorator ||
        type === ModuleActions.ActionTypes.SaveModuleImports
    ),
    withLatestFrom(store$, (action: any, store: any) =>
      store.modules.find(
        (currentModule: any) => currentModule.path === action.path
      )
    ),
    filter(({ status }) => status.fullyLoaded),
    map(({ name, decorator, imports }) =>
      decorator.imports.map(
        ({ name: importName }: any) =>
          new ModuleActions.ExtendModuleDecoratorImports(
            name,
            importName,
            imports
              .filter(
                ({ assignments }: any) =>
                  !!assignments.find(
                    ({ propertyName }: any) => propertyName === importName
                  )
              )
              .reduce((_: any, curr: any) => curr.module, null)
          )
      )
    )
  );

  fetchImported$ = this.actions$.pipe(
    filter(
      ({ type }) =>
        type === ModuleActions.ActionTypes.ExtendModuleDecoratorImports
    ),
    withLatestFrom(store$, (action: any, store: any) => ({
      action,
      module: store.modules.find(
        (currentModule: any) => currentModule.name === action.moduleName
      )
    })),
    map(({ action, module: currentModule }: any) =>
      currentModule.decorator.imports.map(
        (currentImport: any) =>
          new Actions.ReadModule(currentImport.path, action.moduleName)
      )
    )
  );
}
