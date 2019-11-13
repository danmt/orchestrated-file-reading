import { AbstractPipe } from './pipe.interface';
import ts from 'typescript';

class ClassPipe implements AbstractPipe<any> {
  transform(node: ts.Node) {
    return (
      ts.isClassDeclaration(node) && node.name && { name: node.name.getText() }
    );
  }
}

export default new ClassPipe();
