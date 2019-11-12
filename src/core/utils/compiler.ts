import ts from 'typescript';

export const getSourceFile = (path: string, file: string) =>
  ts.createSourceFile(path, file, ts.ScriptTarget.ES2015, true);

export const getImports = (sourceFile: ts.SourceFile) => {
  return sourceFile.statements.filter((statement: ts.Statement) =>
    ts.isImportDeclaration(statement)
  );
};

export const getClasses = (sourceFile: ts.SourceFile) => {
  return sourceFile.statements.filter(statement =>
    ts.isClassDeclaration(statement)
  );
};

export const getKindName = (syntaxKind: ts.SyntaxKind) => {
  return (<any>ts).SyntaxKind[syntaxKind];
};

export const getProperty = (
  propertyName: string,
  object: ts.ObjectLiteralExpression
) =>
  object &&
  ts.isObjectLiteralExpression(object) &&
  object.properties
    .filter(
      (property: ts.ObjectLiteralElementLike) =>
        property.name && property.name.getText() === propertyName
    )
    .reduce(
      (
        _: ts.ObjectLiteralElementLike | null,
        curr: ts.ObjectLiteralElementLike
      ) => curr as ts.PropertyAssignment,
      null
    );

export const getDecorator = (decoratorName: string, node: ts.Node) => {
  return (
    node.decorators &&
    node.decorators
      .filter(
        (decorator: ts.Decorator) =>
          decoratorName ===
          (decorator.expression as ts.CallExpression).expression.getText()
      )
      .reduce((_: ts.Decorator | null, curr: ts.Decorator) => curr, null)
  );
};

export const getDecoratorArgument = () => {};
