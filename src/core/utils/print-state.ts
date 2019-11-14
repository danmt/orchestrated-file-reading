import boxen from 'boxen';
import chalk from 'chalk';

const cfonts = require('cfonts');

export const printState = (state: any) => {
  console.log(stateToString(state));
};

const stateToString = (state: any) => {
  let output = getTitle('Modules');
  state.modules.forEach((currentModule: any) => {
    output += boxen(moduleToString(currentModule), {
      padding: 1,
      margin: 1
    });
  });

  return output;
};

const moduleToString = (currentModule: any) => {
  let moduleAsString = `Name:   ${chalk.bold.blue(currentModule.name)}\n`;
  moduleAsString += `Parent: ${chalk.green(currentModule.parent)}\n`;

  if (currentModule.decorator) {
    moduleAsString += '\nDecorator:\n';
    if (
      currentModule.decorator.imports &&
      currentModule.decorator.imports.length > 0
    ) {
      moduleAsString += '  Imports:\n';
      currentModule.decorator.imports.forEach((currentImport: any) => {
        moduleAsString += `    - ${chalk.blue(currentImport.name)}\n`;
      });
    }
  }

  if (currentModule.imports) {
    moduleAsString += '\nImports:\n';
    currentModule.imports.forEach((currentImport: any) => {
      moduleAsString += `  Path: ${chalk.yellow(currentImport.module)}\n`;
      currentImport.assignments.forEach((assignment: any) => {
        moduleAsString += `    - ${chalk.green(
          assignment.propertyName
        )} as ${chalk.blue(assignment.name)}\n`;
      });
    });
  }

  return moduleAsString;
};

const getTitle = (title: string) =>
  cfonts.render(title, {
    font: 'block', // define the font face
    align: 'left', // define text alignment
    colors: ['system'], // define all colors
    background: 'transparent', // define the background color, you can also use `backgroundColor` here as key
    letterSpacing: 1, // define letter spacing
    lineHeight: 1, // define the line height
    space: true, // define if the output text should have empty lines on top and on the bottom
    maxLength: '0'
  }).string;
