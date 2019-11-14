import { from, Subject, merge } from 'rxjs';
import { mergeMap, scan, shareReplay } from 'rxjs/operators';
import { Effects as GlobalEffects } from './effects';
import { Effects as ModuleEffects } from '../../module/module.effects';
import * as GlobalState from './reducer';
import * as ModuleState from '../../module/module.reducer';
import * as Actions from './actions';
import * as ModuleActions from '../../module/module.actions';

export const dispatcher = new Subject<
  Actions.ActionTypesUnion | ModuleActions.ActionTypesUnion
>();
const actions$ = dispatcher.asObservable();
export const store$ = actions$.pipe(
  scan((state: any, action) => {
    const globalStateReduced = GlobalState.reducer(state, action);
    const moduleStateReduced = ModuleState.reducer(globalStateReduced, action);
    return moduleStateReduced;
  }, GlobalState.initialState),
  shareReplay(1)
);

const globalEffects = new GlobalEffects(actions$);
const moduleEffects = new ModuleEffects(actions$);

merge(
  globalEffects.init$,
  moduleEffects.readModuleDecorator$,
  moduleEffects.readModuleImports$,
  moduleEffects.loadingOver$,
  moduleEffects.fetchImported$
)
  .pipe(
    mergeMap(sideEffect =>
      from(Array.isArray(sideEffect) ? sideEffect : [sideEffect])
    )
  )
  .subscribe(dispatcher);
