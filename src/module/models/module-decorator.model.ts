import chalk from 'chalk';

export class ModuleDecorator {
  constructor(public imports: string[]) {}

  toString() {
    let decoratorAsString = '\nDecorator:\n';
    if (this.imports && this.imports.length > 0) {
      decoratorAsString += '  Imports:\n';
      this.imports.forEach((currentImport: any) => {
        decoratorAsString += `    - ${chalk.blue(currentImport.name)}\n`;
      });
    }
    return decoratorAsString;
  }

  update(changes: any) {
    const newDecorator = { ...this, changes };
    return new ModuleDecorator(newDecorator.imports);
  }
}
