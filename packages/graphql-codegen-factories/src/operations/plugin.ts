import { Kind, FragmentDefinitionNode, concatAST, DocumentNode } from "graphql";
import {
  oldVisit,
  PluginFunction,
  Types,
} from "@graphql-codegen/plugin-helpers";
import {
  FactoriesOperationsVisitor,
  FactoriesOperationsVisitorRawConfig,
} from "./FactoriesOperationsVisitor";

export const plugin: PluginFunction<
  FactoriesOperationsVisitorRawConfig,
  Types.ComplexPluginOutput
> = (schema, documents, config) => {
  const allAst = concatAST(
    documents.map(({ document }) => document as DocumentNode)
  );
  const fragments = allAst.definitions.filter(
    (d) => d.kind === Kind.FRAGMENT_DEFINITION
  ) as FragmentDefinitionNode[];
  const allFragments: FragmentDefinitionNode[] = [
    ...fragments,
    // `externalFragments` config is passed by the near-operation-file preset.
    // It is an array of fragments declared outside of the operation file.
    ...(config.externalFragments || []).map(({ node }) => node),
  ];

  const visitor = new FactoriesOperationsVisitor(schema, allFragments, config);
  const content = (
    oldVisit(allAst, { leave: visitor }) as DocumentNode
  ).definitions
    .filter((definition) => typeof definition === "string")
    .join("\n");

  return {
    prepend: visitor.getImports(),
    content,
  };
};
