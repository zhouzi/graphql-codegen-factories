import { Kind, FragmentDefinitionNode, concatAST, DocumentNode } from "graphql";
import {
  oldVisit,
  PluginFunction,
  Types,
} from "@graphql-codegen/plugin-helpers";
import { LoadedFragment } from "@graphql-codegen/visitor-plugin-common";
import { FactoriesBaseVisitorRawConfig } from "../FactoriesBaseVisitor";
import { FactoriesOperationsVisitor } from "./FactoriesOperationsVisitor";

export const plugin: PluginFunction<
  FactoriesBaseVisitorRawConfig,
  Types.ComplexPluginOutput
> = (schema, documents, config) => {
  const allAst = concatAST(
    documents.map(({ document }) => document as DocumentNode)
  );
  const fragmentDefinitions = allAst.definitions.filter(
    (d) => d.kind === Kind.FRAGMENT_DEFINITION
  ) as FragmentDefinitionNode[];
  const allFragments: LoadedFragment[] = fragmentDefinitions.map(
    (fragmentDefinition) => ({
      node: fragmentDefinition,
      name: fragmentDefinition.name.value,
      onType: fragmentDefinition.typeCondition.name.value,
      isExternal: false,
    })
  );

  const visitor = new FactoriesOperationsVisitor(schema, allFragments, config);
  const content = oldVisit(allAst, { leave: visitor }).definitions.join("\n");

  return {
    prepend: visitor.getImports(),
    content,
  };
};
