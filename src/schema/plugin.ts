import { printSchema, parse } from "graphql";
import {
  oldVisit,
  PluginFunction,
  Types,
} from "@graphql-codegen/plugin-helpers";
import { FactoriesBaseVisitorRawConfig } from "../FactoriesBaseVisitor";
import { FactoriesSchemaVisitor } from "./FactoriesSchemaVisitor";

export const plugin: PluginFunction<
  FactoriesBaseVisitorRawConfig,
  Types.ComplexPluginOutput
> = (schema, documents, config) => {
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);

  const visitor = new FactoriesSchemaVisitor(schema, config);
  const content = oldVisit(astNode, { leave: visitor })
    .definitions.filter(Boolean)
    .join("\n");

  return {
    prepend: visitor.getImports(),
    content,
  };
};
