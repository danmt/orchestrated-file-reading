import { AbstractPipe } from './abstract.pipe';
import ts from 'typescript';

export interface ImportSpecifier {
  name: string; // In case of an alias
  propertyName?: string;
  isNamespace?: boolean;
}

export interface ImportDeclaration {
  module: string;
  assignments: ImportSpecifier[];
}

class ImportPipe extends AbstractPipe<ImportDeclaration> {
  transform({ moduleSpecifier, importClause }: ts.ImportDeclaration) {
    return {
      module: moduleSpecifier.getText().replace(/['"]+/g, ''),
      assignments: [
        ...this.pipe(
          (importClause: ts.ImportClause) =>
            this.getImportNamedBindings(importClause),
          (namedBindings: ts.NamespaceImport) =>
            this.getNamespaceImport(namedBindings)
        )(importClause),
        ...this.pipe(
          (importClause: ts.ImportClause) =>
            this.getImportNamedBindings(importClause),
          (namedBindings: ts.NamedImports) =>
            this.getNamedImports(namedBindings)
        )(importClause)
      ]
    } as ImportDeclaration;
  }

  private getImportNamedBindings(importClause: ts.ImportClause) {
    return importClause ? importClause.namedBindings : null;
  }

  private getNamespaceImport(namespaceImport: ts.NamespaceImport) {
    return namespaceImport && ts.isNamespaceImport(namespaceImport)
      ? [
          {
            name: namespaceImport.name.getText(),
            isNamespace: true
          }
        ]
      : [];
  }

  private getNamedImports(namedImports: ts.NamedImports) {
    return namedImports && ts.isNamedImports(namedImports)
      ? namedImports.elements.map((importSpecifier: ts.ImportSpecifier) => ({
          name: importSpecifier.name.getText(),
          propertyName: this.getPropertyName(importSpecifier)
        }))
      : [];
  }

  private getPropertyName(importSpecifier: ts.ImportSpecifier) {
    return importSpecifier && importSpecifier.propertyName
      ? importSpecifier.propertyName.text
      : importSpecifier.name.escapedText.toString();
  }
}

export default new ImportPipe();
