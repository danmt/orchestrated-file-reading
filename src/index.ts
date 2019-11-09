import { promises as fs } from 'fs';
import path from 'path';
import { defer, from, zip, Subject, merge } from 'rxjs';
import { mergeMap, scan, shareReplay, filter, map } from 'rxjs/operators';

const calleeDir = process.cwd();
const mocksDir = path.join(calleeDir, 'mocks', 'simple');

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
    case 'READ_MODULE':
      return {
        ...state,
        modules: [
          ...state.modules,
          {
            path: action.filePath,
            parent: action.parent
          }
        ]
      };
    case 'MODULE_READ':
      return {
        ...state,
        modules: state.modules.map((currentModule: any) =>
          currentModule.path === action.path
            ? {
                ...currentModule,
                name: action.name
              }
            : currentModule
        )
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
          path: filePath,
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
        readJSONFile$(path.join(mocksDir, declaration)).pipe(
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

const readImports$ = actions$.pipe(
  filter(({ type }: any) => type === 'READ_IMPORTS'),
  map(action =>
    action.imports.map((importedModule: string) => ({
      type: 'READ_MODULE',
      filePath: path.join(mocksDir, importedModule),
      parent: action.name
    }))
  )
);

const effects = [readModule$, readDeclarations$, readImports$];

merge(...effects)
  .pipe(
    mergeMap(sideEffect =>
      from(Array.isArray(sideEffect) ? sideEffect : [sideEffect])
    )
  )
  .subscribe(dispatcher);

dispatcher.next({
  type: 'READ_MODULE',
  filePath: path.join(mocksDir, 'module-a.json'),
  parent: 'root'
});
