import ts from 'typescript';

export interface AbstractPipe<T> {
  transform: (node: ts.Node) => T;
}
