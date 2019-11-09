import { promises as fs } from 'fs';
import path from 'path';
import { defer, from, zip, Subject, merge } from 'rxjs';
import { mergeMap, tap, scan, shareReplay, filter, map } from 'rxjs/operators';

const calleeDir = process.cwd();
const mocksDir = path.join(calleeDir, 'mocks');

/* 
  Go through the simple mock and read the files asynchronously in this order:

  - Level 1
    - Level 1.1 and Level 1.2
*/

const simpleMockDir = path.join(mocksDir, 'simple');

const readFile$ = (filePath: string) =>
  defer(() => from(fs.readFile(filePath)));

const readJSONFile$ = (filePath: string) =>
  readFile$(filePath).pipe(
    map(fileContent => JSON.parse(fileContent.toString()))
  );

const initialState = {};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'READ_DECLARATIONS':
      return {
        ...state,
        declarations: action.declarations.map((path: string) => ({
          path
        }))
      };
    case 'DECLARATION_READ':
      return {
        ...state,
        declarations: state.declarations.map((declaration: any) => {
          return declaration.path === action.path
            ? { path: action.path, text: action.text }
            : declaration;
        })
      };
    default:
      return state;
  }
};

const dispatcher = new Subject();
const actions$ = dispatcher.asObservable();
const store$ = actions$.pipe(
  scan((state: any, action) => reducer(state, action), initialState),
  shareReplay(1)
);

store$.subscribe(state => console.log('state:', state));

// Effect
const readModule$ = actions$.pipe(
  filter(({ type }: any) => type === 'READ_MODULE'),
  mergeMap(({ filePath }: any) =>
    readJSONFile$(filePath).pipe(
      map(({ declarations }) => ({
        type: 'READ_DECLARATIONS',
        declarations
      }))
    )
  )
);

const readDeclarations$ = actions$.pipe(
  filter(({ type }: any) => type === 'READ_DECLARATIONS'),
  mergeMap(({ declarations }: any) =>
    zip(
      ...declarations.map((declaration: string) =>
        readJSONFile$(path.join(simpleMockDir, declaration)).pipe(
          map(({ text }) => ({
            type: 'DECLARATION_READ',
            path: declaration,
            text
          }))
        )
      )
    )
  )
);

const effects = [readModule$, readDeclarations$];

merge(...effects)
  .pipe(
    mergeMap(sideEffect =>
      from(Array.isArray(sideEffect) ? sideEffect : [sideEffect])
    )
  )
  .subscribe(dispatcher);

dispatcher.next({
  type: 'READ_MODULE',
  filePath: path.join(simpleMockDir, 'level-1.json')
});
