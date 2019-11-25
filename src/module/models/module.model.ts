import chalk from 'chalk';
import { ModuleStatus } from './module-status.model';
import { ModuleDecorator } from './module-decorator.model';
import { ModuleImport } from './module-imports.model';

export class Module {
  name?: string;
  status = new ModuleStatus();
  decorator?: ModuleDecorator;
  imports: ModuleImport[] = [];

  constructor(public path: string, public parent = 'root') {}

  toString() {
    let moduleAsString = `Name:   ${chalk.bold.blue(this.name)}\n`;
    moduleAsString += `Parent: ${chalk.green(this.parent)}\n`;

    if (this.decorator) {
      moduleAsString += this.decorator.toString();
    }

    if (this.imports) {
      moduleAsString += '\nImports:\n';
      this.imports.forEach((currentImport: ModuleImport) => {
        currentImport.toString();
      });
    }

    return moduleAsString;
  }
}
