import { filter, mergeMap, map, tap } from 'rxjs/operators';
import { zip, Observable } from 'rxjs';
import path from 'path';
import { readFile$, readJSONFile$ } from '../utils/read-file';
import * as Actions from './actions';
import { ActionTypes, ActionTypesUnion } from './actions';
import { getSourceFile, getClasses, getImports } from '../utils/compiler';
import modulePipe from '../../shared/pipes/module.pipe';
import importPipe from '../../shared/pipes/import.pipe';

const calleeDir = process.cwd();
const mocksDir = path.join(calleeDir, 'mocks', 'simple');

const baseDir = path.join(calleeDir, 'mocks');

export class Effects {
  constructor(public actions$: Observable<ActionTypesUnion>) {}

  init$ = this.actions$.pipe(
    filter(({ type }) => type === ActionTypes.Init),
    map(
      () => new Actions.ReadModule(path.join(baseDir, 'app.module.ts'), 'root')
    )
  );

  readModuleDecorator$ = this.actions$.pipe(
    filter(({ type }) => type === ActionTypes.ReadModule),
    map(action => action as Actions.ReadModule),
    mergeMap(({ path: filePath }: Actions.ReadModule) =>
      readFile$(filePath).pipe(
        map(file => getSourceFile(filePath, file.toString())),
        tap(sourceFile =>
          console.log(
            getImports(sourceFile).map((statement: any) =>
              importPipe.transform(statement)
            )
          )
        ),
        map(sourceFile =>
          getClasses(sourceFile)
            .map((node: any) => modulePipe.transform(node))
            .reduce((_: any, current: any) => current)
        ),
        tap((currentModule: any) => {
          console.log('y tal', currentModule);
        }),
        map(() => [])
        /* map(({ name, declarations, imports }: any) => [
          new Actions.ModuleRead(filePath, name),
          new Actions.ReadDeclarations(name, declarations),
          new Actions.ReadImports(name, imports)
        ]) */
      )
    )
  );

  readModuleImports$ = this.actions$.pipe(
    filter(({ type }) => type === ActionTypes.ReadModule),
    map(action => action as Actions.ReadModule),
    mergeMap(({ path: filePath }: Actions.ReadModule) =>
      readFile$(filePath).pipe(
        map(file => getSourceFile(filePath, file.toString())),
        map(sourceFile =>
          getImports(sourceFile).map((statement: any) =>
            importPipe.transform(statement)
          )
        ),
        tap((currentModule: any) => {
          console.log('y tal', currentModule);
        }),
        map(() => [])
        /* map(({ name, declarations, imports }: any) => [
          new Actions.ModuleRead(filePath, name),
          new Actions.ReadDeclarations(name, declarations),
          new Actions.ReadImports(name, imports)
        ]) */
      )
    )
  );

  readDeclarations$ = this.actions$.pipe(
    filter(({ type }) => type === ActionTypes.ReadDeclarations),
    map(action => action as Actions.ReadDeclarations),
    mergeMap((action: Actions.ReadDeclarations) =>
      zip(
        ...action.declarations.map((declaration: string) =>
          readJSONFile$(path.join(mocksDir, declaration)).pipe(
            map(
              ({ name, text }: any) =>
                new Actions.DeclarationRead(
                  action.name,
                  name,
                  declaration,
                  text
                )
            )
          )
        )
      )
    )
  );

  readImports$ = this.actions$.pipe(
    filter(({ type }) => type === ActionTypes.ReadImports),
    map(action => action as Actions.ReadImports),
    map((action: Actions.ReadImports) =>
      action.imports.map(
        (importedModule: string) =>
          new Actions.ReadModule(
            path.join(mocksDir, importedModule),
            action.name
          )
      )
    )
  );
}
