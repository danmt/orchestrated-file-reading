import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import path from 'path';
import * as Actions from './actions';
import * as ModuleActions from '../../module/state/module.actions';

const BASE_DIR = path.join(process.cwd(), 'mocks');

export class Effects {
  constructor(
    public actions$: Observable<
      Actions.ActionTypesUnion | ModuleActions.ActionTypesUnion
    >
  ) {}

  init$ = this.actions$.pipe(
    filter(({ type }) => type === Actions.ActionTypes.Init),
    map(
      () => new ModuleActions.ReadModule(path.join(BASE_DIR, 'app.module.ts'), 'root')
    )
  );
}
