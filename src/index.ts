import { store$, dispatcher } from './core/state';
import * as Actions from './core/state/actions';

const main = () => {
  store$.subscribe(state => {
    /* if (state.modules && state.modules.length === 3) {
      console.log('\n first module', state.modules[0]);
      console.log('\n second module', state.modules[1]);
      console.log('\n third module', state.modules[2]);
    } */
  });

  dispatcher.next(new Actions.Init());
};

main();
