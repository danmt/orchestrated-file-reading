import ts = require('typescript');

export interface AbstractPipe<T> {
  transform: (node: ts.Node) => T;
}
