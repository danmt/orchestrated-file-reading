import { AbstractPipe } from './pipe.interface';
import { getProperty, getDecorator } from '../../core/utils/compiler';
import * as ts from 'typescript';

class ModulePipe implements AbstractPipe<any> {
  transform(node: ts.Node) {
    return {
      imports:
        this.getPropertyValue(
          getProperty(
            'imports',
            this.getFirstArgument(getDecorator('NgModule', node))
          )
        ) || []
    } as any;
  }

  private getPropertyValue(property: any) {
    return property.initializer.elements.map((expression: ts.Expression) =>
      expression.getText()
    );
  }

  private getFirstArgument(decorator: any) {
    return (
      decorator.expression.arguments.length > 0 &&
      decorator.expression.arguments[0]
    );
  }
}

export default new ModulePipe();
