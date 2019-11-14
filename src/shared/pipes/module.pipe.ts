import { AbstractPipe } from './abstract.pipe';
import { getProperty, getDecorator } from '../../core/utils/compiler';
import ts from 'typescript';

interface ModuleDecorator {
  imports: string[];
}

class ModulePipe extends AbstractPipe<ModuleDecorator> {
  transform(node: ts.Node) {
    return {
      imports:
        this.pipe(
          (node: ts.Node) => getDecorator('NgModule', node),
          (decorator: ts.Decorator) => this.getFirstArgument(decorator),
          (firstArgument: ts.ObjectLiteralExpression) =>
            firstArgument && getProperty('imports', firstArgument),
          (property: ts.PropertyAssignment) => this.getPropertyValue(property)
        )(node) || []
    } as ModuleDecorator;
  }

  private getPropertyValue(property: ts.PropertyAssignment) {
    if (
      !property ||
      !property.initializer ||
      !ts.isArrayLiteralExpression(property.initializer)
    ) {
      return [];
    }

    return property.initializer.elements.map((expression: ts.Expression) =>
      expression.getText()
    );
  }

  private getFirstArgument(decorator: ts.Decorator) {
    if (
      !decorator ||
      !decorator.expression ||
      !ts.isCallExpression(decorator.expression)
    ) {
      return null;
    }

    return (
      decorator.expression.arguments.length > 0 &&
      decorator.expression.arguments[0]
    );
  }
}

export default new ModulePipe();
