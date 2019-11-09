import { promises as fs } from 'fs';
import path from 'path';
import { defer, from, zip, Subject, merge } from 'rxjs';
import { mergeMap, scan, shareReplay, filter, map } from 'rxjs/operators';

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

const initialState = {
  modules: []
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'MODULE_READ':
      return {
        ...state,
        modules: [
          ...state.modules,
          { name: action.name, declarations: [], imports: [] }
        ]
      };
    case 'READ_DECLARATIONS':
      return {
        ...state,
        modules: state.modules.map((currentModule: any) =>
          currentModule.name === action.name
            ? {
                ...currentModule,
                declarations: action.declarations.map((path: string) => ({
                  path
                }))
              }
            : currentModule
        )
      };
    case 'READ_IMPORTS':
      return {
        ...state,
        modules: state.modules.map((currentModule: any) =>
          currentModule.name === action.name
            ? {
                ...currentModule,
                imports: action.imports.map((path: string) => ({
                  path
                }))
              }
            : currentModule
        )
      };
    case 'DECLARATION_READ':
      return {
        ...state,
        modules: state.modules.map((currentModule: any) =>
          currentModule.name === action.module
            ? {
                ...currentModule,
                declarations: currentModule.declarations.map(
                  (declaration: any) =>
                    declaration.path === action.path
                      ? {
                          path: action.path,
                          text: action.text,
                          name: action.name
                        }
                      : declaration
                )
              }
            : currentModule
        )
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

store$.subscribe(state => console.log(state));

// Effect
const readModule$ = actions$.pipe(
  filter(({ type }: any) => type === 'READ_MODULE'),
  mergeMap(({ filePath }: any) =>
    readJSONFile$(filePath).pipe(
      map(({ name, declarations, imports }) => [
        {
          type: 'MODULE_READ',
          name
        },
        {
          type: 'READ_DECLARATIONS',
          name,
          declarations
        },
        {
          type: 'READ_IMPORTS',
          name,
          imports
        }
      ])
    )
  )
);

const readDeclarations$ = actions$.pipe(
  filter(({ type }: any) => type === 'READ_DECLARATIONS'),
  mergeMap((action: any) =>
    zip(
      ...action.declarations.map((declaration: string) =>
        readJSONFile$(path.join(simpleMockDir, declaration)).pipe(
          map(({ name, text }) => ({
            type: 'DECLARATION_READ',
            module: action.name,
            name: name,
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
  filePath: path.join(simpleMockDir, 'module-a.json')
});
