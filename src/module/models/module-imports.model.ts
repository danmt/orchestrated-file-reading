import chalk from 'chalk';

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