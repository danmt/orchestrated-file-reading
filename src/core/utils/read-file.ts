import { defer, from } from 'rxjs';
import { promises as fs } from 'fs';
import { map } from 'rxjs/operators';
import { getSourceFile } from './compiler';

export const readFile$ = (filePath: string) =>
  defer(() => from(fs.readFile(filePath)));

export const readJSONFile$ = (filePath: string) =>
  readFile$(filePath).pipe(
    map(fileContent => JSON.parse(fileContent.toString()))
  );

export const readFileAndGetAST$ = (filePath: string) =>
  defer(() => from(fs.readFile(filePath))).pipe(
    map(file => getSourceFile(filePath, file.toString()))
  );
