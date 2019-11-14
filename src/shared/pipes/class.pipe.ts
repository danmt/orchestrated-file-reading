import { AbstractPipe } from './abstract.pipe';
import ts from 'typescript';

class ClassPipe extends AbstractPipe<any> {
  transform(node: ts.Node) {
    return (
      ts.isClassDeclaration(node) && node.name && { name: node.name.getText() }
    );
  }
}

export default new ClassPipe();
