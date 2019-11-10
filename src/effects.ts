import { filter, mergeMap, map } from 'rxjs/operators';
import { zip, Observable } from 'rxjs';
import path from 'path';
import { readJSONFile$ } from './utils';
import * as Actions from './actions';
import { ActionTypes, ActionTypesUnion } from './actions';

const calleeDir = process.cwd();
const mocksDir = path.join(calleeDir, 'mocks', 'simple');

export class Effects {
  constructor(public actions$: Observable<ActionTypesUnion>) {}

  readModule$ = this.actions$.pipe(
    filter(({ type }) => type === ActionTypes.ReadModule),
    map(action => action as Actions.ReadModule),
    mergeMap(({ path: filePath }: Actions.ReadModule) =>
      readJSONFile$(filePath).pipe(
        map(({ name, declarations, imports }: any) => [
          new Actions.ModuleRead(filePath, name),
          new Actions.ReadDeclarations(name, declarations),
          new Actions.ReadImports(name, imports)
        ])
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
