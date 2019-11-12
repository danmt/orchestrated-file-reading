import { from, Subject, merge } from 'rxjs';
import { mergeMap, scan, shareReplay } from 'rxjs/operators';
import { Effects as GlobalEffects } from './effects';
import { Effects as ModuleEffects } from '../../module/module.effects';
import { reducer, initialState } from './reducer';
import * as Actions from './actions';
import * as ModuleActions from '../../module/module.actions';

export const dispatcher = new Subject<
  Actions.ActionTypesUnion | ModuleActions.ActionTypesUnion
>();
const actions$ = dispatcher.asObservable();
export const store$ = actions$.pipe(
  scan((state: any, action) => reducer(state, action), initialState),
  shareReplay(1)
);

const globalEffects = new GlobalEffects(actions$);
const moduleEffects = new ModuleEffects(actions$);

merge(
  globalEffects.readDeclarations$,
  globalEffects.readImports$,
  globalEffects.init$,
  moduleEffects.readModuleDecorator$,
  moduleEffects.readModuleImports$
)
  .pipe(
    mergeMap(sideEffect =>
      from(Array.isArray(sideEffect) ? sideEffect : [sideEffect])
    )
  )
  .subscribe(dispatcher);
