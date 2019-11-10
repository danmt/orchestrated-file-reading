import path from 'path';
import { from, Subject, merge } from 'rxjs';
import { mergeMap, scan, shareReplay } from 'rxjs/operators';
import { Effects } from './effects';
import { reducer, initialState } from './reducer';
import * as Actions from './actions';

const calleeDir = process.cwd();
const mocksDir = path.join(calleeDir, 'mocks', 'simple');

const dispatcher = new Subject<Actions.ActionTypesUnion>();
const actions$ = dispatcher.asObservable();
const store$ = actions$.pipe(
  scan((state: any, action) => reducer(state, action), initialState),
  shareReplay(1)
);

const effects = new Effects(actions$);

merge(effects.readDeclarations$, effects.readImports$, effects.readModule$)
  .pipe(
    mergeMap(sideEffect =>
      from(Array.isArray(sideEffect) ? sideEffect : [sideEffect])
    )
  )
  .subscribe(dispatcher);

store$.subscribe(state => console.log(state));

dispatcher.next(
  new Actions.ReadModule(path.join(mocksDir, 'module-a.json'), 'root')
);
