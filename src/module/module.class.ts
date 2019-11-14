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

export class ModuleImport {
  constructor(public path: string, public assignments: { name: string }[]) {}

  toString() {
    let importAsString = `  Path: ${chalk.yellow(this.path)}\n`;
    this.assignments.forEach((assignment: any) => {
      importAsString += `    - ${chalk.green(
        assignment.propertyName
      )} as ${chalk.blue(assignment.name)}\n`;
    });
    return importAsString;
  }
}

export class ModuleStatus {
  decoratorLoaded = false;
  importsLoaded = false;
  fullyLoaded = false;
}

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
