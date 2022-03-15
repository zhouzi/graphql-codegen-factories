import { printSchema, parse } from "graphql";
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
  const visitor = new FactoriesSchemaVisitor(schema, config);
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const content = oldVisit(astNode, { leave: visitor })
    .definitions.filter(Boolean)
    .join("\n");

  return {
    prepend: visitor.getImports(),
    content,
  };
};
