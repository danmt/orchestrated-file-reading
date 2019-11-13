import { store$, dispatcher } from './core/state';
import * as Actions from './core/state/actions';

const main = () => {
  store$.subscribe(state => {
    if (state.modules && state.modules.length > 1) {
      console.log(state.modules[0]);
      console.log(state.modules[1]);
    }
  });

  dispatcher.next(new Actions.Init());
};

main();
