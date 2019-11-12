import * as Actions from '../core/state/actions';
import * as ModuleActions from './module.actions';
import { Observable } from 'rxjs';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { readFileAndGetAST$ } from '../core/utils/read-file';
import { getImports, getClasses } from '../core/utils/compiler';
import importPipe from '../shared/pipes/import.pipe';
import modulePipe from '../shared/pipes/module.pipe';

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
        map(sourceFile =>
          getClasses(sourceFile)
            .map((node: any) => modulePipe.transform(node))
            .reduce((_: any, current: any) => current)
        ),
        tap((moduleDecorator: any) => {
          console.log('y tal', moduleDecorator);
        }),
        map(
          (moduleDecorator: any) =>
            new ModuleActions.SaveModuleDecorator(moduleDecorator)
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
        tap((moduleImports: any) => {
          console.log('y tal', moduleImports);
        }),
        map(
          (moduleImports: any) =>
            new ModuleActions.SaveModuleImports(moduleImports)
        )
      )
    )
  );
}
