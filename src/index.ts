import { store$, dispatcher } from './core/state';
import * as Actions from './core/state/actions';
import { printState } from './core/utils/print-state';
import { debounceTime } from 'rxjs/operators';

const main = () => {
  store$.pipe(debounceTime(200)).subscribe(state => {
    printState(state);
  });

  dispatcher.next(new Actions.Init());
};

main();
