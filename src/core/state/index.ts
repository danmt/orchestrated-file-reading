import { from, Subject, merge } from 'rxjs';
import { mergeMap, scan, shareReplay } from 'rxjs/operators';
import { Effects } from './effects';
import { reducer, initialState } from './reducer';
import * as Actions from './actions';

export const dispatcher = new Subject<Actions.ActionTypesUnion>();
const actions$ = dispatcher.asObservable();
export const store$ = actions$.pipe(
  scan((state: any, action) => reducer(state, action), initialState),
  shareReplay(1)
);

const effects = new Effects(actions$);

merge(
  effects.readDeclarations$,
  effects.readImports$,
  effects.readModuleDecorator$,
  effects.readModuleImports$,
  effects.init$
)
  .pipe(
    mergeMap(sideEffect =>
      from(Array.isArray(sideEffect) ? sideEffect : [sideEffect])
    )
  )
  .subscribe(dispatcher);

/* store$.subscribe(state => console.log(state));

dispatcher.next(new Actions.Init()); */
