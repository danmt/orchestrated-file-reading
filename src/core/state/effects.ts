import { filter, mergeMap, map, tap } from 'rxjs/operators';
import { zip, Observable } from 'rxjs';
import path from 'path';
import { readJSONFile$ } from '../utils/read-file';
import * as Actions from './actions';
import * as ModuleActions from '../../module/module.actions';

const calleeDir = process.cwd();
const mocksDir = path.join(calleeDir, 'mocks', 'simple');

const baseDir = path.join(calleeDir, 'mocks');

export class Effects {
  constructor(
    public actions$: Observable<
      Actions.ActionTypesUnion | ModuleActions.ActionTypesUnion
    >
  ) {}

  init$ = this.actions$.pipe(
    filter(({ type }) => type === Actions.ActionTypes.Init),
    map(
      () => new Actions.ReadModule(path.join(baseDir, 'app.module.ts'), 'root')
    )
  );

  readDeclarations$ = this.actions$.pipe(
    filter(({ type }) => type === Actions.ActionTypes.ReadDeclarations),
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
    filter(({ type }) => type === Actions.ActionTypes.ReadImports),
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
