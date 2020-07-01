import { printSchema, parse, visit } from "graphql";
import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import {
  FactoriesVisitor,
  FactoriesVisitorRawConfig,
} from "./FactoriesVisitor";

export const plugin: PluginFunction<
  FactoriesVisitorRawConfig,
  Types.ComplexPluginOutput
> = (schema, documents, config) => {
  const visitor = new FactoriesVisitor(schema, config);
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);

  return visit(astNode, { leave: visitor })
    .definitions.filter(Boolean)
    .join("\n");
};
