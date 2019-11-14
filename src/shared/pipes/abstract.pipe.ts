import ts from 'typescript';

export interface IAbstractPipe<T> {
  transform: (node: ts.Node) => T;
}

export abstract class AbstractPipe<T> implements IAbstractPipe<T> {
  pipe = (...fns: any) => (arg: any) =>
    fns.reduce((prev: any, fn: any) => fn(prev), arg);

  transform(_: ts.Node) {
    return {} as T;
  }
}
