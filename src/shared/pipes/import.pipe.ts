import { AbstractPipe } from './pipe.interface';
import ts = require('typescript');

export interface ImportSpecifier {
  name: string;
  propertyName?: string;
  isNamespace?: boolean;
}

export interface ImportDeclaration {
  module: string;
  imports: ImportSpecifier[];
}

class ImportPipe implements AbstractPipe<ImportDeclaration> {
  transform({ moduleSpecifier, importClause }: any) {
    return {
      module: moduleSpecifier.getText().replace(/['"]+/g, ''),
      imports: [
        ...(ts.isNamespaceImport(importClause.namedBindings)
          ? this.getNamespaceImport(importClause.namedBindings)
          : []),
        ...(ts.isNamedImports(importClause.namedBindings)
          ? this.getNamedImports(importClause.namedBindings)
          : [])
      ]
    } as ImportDeclaration;
  }

  private getNamespaceImport({ name }: ts.NamespaceImport) {
    return [
      {
        name: name.getText(),
        isNamespace: true
      }
    ];
  }

  private getNamedImports(namedImports: ts.NamedImports) {
    return namedImports.elements.map((importSpecifier: ts.ImportSpecifier) => ({
      name: importSpecifier.name.getText(),
      propertyName: this.getPropertyName(importSpecifier)
    }));
  }

  private getPropertyName(importSpecifier: ts.ImportSpecifier) {
    return importSpecifier.propertyName
      ? importSpecifier.propertyName.text
      : importSpecifier.name.escapedText.toString();
  }
}

export default new ImportPipe();
