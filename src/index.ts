import { store$, dispatcher } from './core/state';
import * as Actions from './core/state/actions';

const main = () => {
  store$.subscribe(state => console.log(state));

  dispatcher.next(new Actions.Init());
};

main();
