import { printSchema, parse } from "graphql";
import {
  oldVisit,
  PluginFunction,
  Types,
} from "@graphql-codegen/plugin-helpers";
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
  const content = oldVisit(astNode, { leave: visitor })
    .definitions.filter(Boolean)
    .join("\n");

  return {
    prepend: visitor.getImports(),
    content,
  };
};
