import { printSchema, parse, DocumentNode } from "graphql";
import {
  oldVisit,
  PluginFunction,
  Types,
} from "@graphql-codegen/plugin-helpers";
import {
  FactoriesSchemaVisitor,
  FactoriesSchemaVisitorRawConfig,
} from "./FactoriesSchemaVisitor";

export const plugin: PluginFunction<
  FactoriesSchemaVisitorRawConfig,
  Types.ComplexPluginOutput
> = (schema, documents, config) => {
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);

  const visitor = new FactoriesSchemaVisitor(schema, config);
  const content = (
    oldVisit(astNode, { leave: visitor }) as DocumentNode
  ).definitions
    .filter((definition) => typeof definition === "string")
    .join("\n");

  return {
    prepend: visitor.getImports(),
    content,
  };
};
