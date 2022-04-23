import { getBaseType } from "@graphql-codegen/plugin-helpers";
import { getPossibleTypes } from "@graphql-codegen/visitor-plugin-common";
import { pascalCase } from "change-case-all";
import {
  FragmentDefinitionNode,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
  Kind,
  OperationDefinitionNode,
  SelectionNode,
} from "graphql";
import { FactoriesBaseVisitorRawConfig } from "../FactoriesBaseVisitor";
import { FactoriesBaseVisitor } from "../FactoriesBaseVisitor";
import { print } from "../print";

interface NormalizedOperation {
  kind: Kind.OPERATION_DEFINITION;
  factoryName: string;
  type: GraphQLObjectType;
  selections: NormalizedSelection[];
}

interface NormalizedInlineFragment {
  kind: Kind.INLINE_FRAGMENT;
  factoryName: string;
  typeCondition: GraphQLObjectType | GraphQLInterfaceType | undefined;
  selections: NormalizedSelection[];
}

interface NormalizedFragmentSpread {
  kind: Kind.FRAGMENT_SPREAD;
  factoryName: string;
  typeCondition: GraphQLObjectType | GraphQLInterfaceType;
  selections: NormalizedSelection[];
}

interface NormalizedObjectField {
  kind: Kind.FIELD;
  name: string;
  alias: string | undefined;
  factoryName: string;
  type: GraphQLOutputType;
  selections: NormalizedSelection[];
}

interface NormalizedScalarField {
  kind: Kind.FIELD;
  name: string;
  alias: string | undefined;
  factoryName: string;
  type: GraphQLOutputType;
  selections: undefined;
}

type NormalizedSelection =
  | NormalizedOperation
  | NormalizedInlineFragment
  | NormalizedFragmentSpread
  | NormalizedObjectField
  | NormalizedScalarField;

export class FactoriesOperationsVisitor extends FactoriesBaseVisitor {
  private schema: GraphQLSchema;
  private fragments: FragmentDefinitionNode[];
  private unnamedCounter = 1;

  constructor(
    schema: GraphQLSchema,
    fragments: FragmentDefinitionNode[],
    config: FactoriesBaseVisitorRawConfig
  ) {
    super(schema, config);

    this.schema = schema;
    this.fragments = fragments;
  }

  private handleAnonymousOperation(
    node: Pick<OperationDefinitionNode, "name">
  ): string {
    const name = node.name && node.name.value;

    if (name) {
      return this.convertName(name, {
        useTypesPrefix: false,
        useTypesSuffix: false,
      });
    }

    return this.convertName(String(this.unnamedCounter++), {
      prefix: "Unnamed_",
      suffix: "_",
      useTypesPrefix: false,
      useTypesSuffix: false,
    });
  }

  private normalizeSelectionNode(
    parent: GraphQLObjectType | GraphQLInterfaceType,
    selection: OperationDefinitionNode | SelectionNode
  ): NormalizedSelection {
    switch (selection.kind) {
      case Kind.FRAGMENT_SPREAD: {
        const fragment = this.fragments.find(
          (otherFragment) => otherFragment.name.value === selection.name.value
        );

        if (fragment == null) {
          throw new Error(`Fragment not found "${selection.name.value}"`);
        }

        const typeCondition = this.schema.getType(
          fragment.typeCondition.name.value
        ) as GraphQLObjectType | GraphQLInterfaceType | undefined;

        if (typeCondition == null) {
          throw new Error(
            `Fragment "${fragment.name.value}"'s type "${fragment.typeCondition.name.value}" not found`
          );
        }

        return {
          kind: Kind.FRAGMENT_SPREAD,
          factoryName: typeCondition.name,
          typeCondition: typeCondition,
          selections: fragment.selectionSet.selections.map((childSelection) =>
            this.normalizeSelectionNode(typeCondition, childSelection)
          ),
        };
      }
      case Kind.INLINE_FRAGMENT: {
        let typeCondition:
          | GraphQLObjectType
          | GraphQLInterfaceType
          | undefined = undefined;

        if (selection.typeCondition) {
          typeCondition = this.schema.getType(
            selection.typeCondition.name.value
          ) as GraphQLObjectType | GraphQLInterfaceType | undefined;

          if (typeCondition == null) {
            throw new Error(
              `Inline fragment's type "${selection.typeCondition.name.value}" not found`
            );
          }
        }

        return {
          kind: Kind.INLINE_FRAGMENT,
          factoryName: typeCondition?.name ?? "undefined",
          typeCondition: typeCondition,
          selections: selection.selectionSet.selections.map((childSelection) =>
            this.normalizeSelectionNode(typeCondition ?? parent, childSelection)
          ),
        };
      }
      case Kind.OPERATION_DEFINITION: {
        const name = this.handleAnonymousOperation(selection);
        const operationType = pascalCase(selection.operation);
        const operationTypeSuffix = this.getOperationSuffix(
          name,
          operationType
        );

        return {
          kind: Kind.OPERATION_DEFINITION,
          factoryName: this.convertFactoryName(name, {
            suffix: operationTypeSuffix,
          }),
          type: parent as GraphQLObjectType,
          selections: selection.selectionSet.selections.map((childSelection) =>
            this.normalizeSelectionNode(parent, childSelection)
          ),
        };
      }
      case Kind.FIELD:
      default: {
        const type = parent.getFields()[selection.name.value].type;
        if (selection.selectionSet) {
          return {
            kind: Kind.FIELD,
            name: selection.name.value,
            alias: selection.alias?.value,
            factoryName: selection.alias?.value ?? selection.name.value,
            type: type,
            selections: selection.selectionSet.selections.map(
              (childSelection) =>
                this.normalizeSelectionNode(
                  getBaseType(type) as GraphQLObjectType | GraphQLInterfaceType,
                  childSelection
                )
            ),
          };
        }
        return {
          kind: Kind.FIELD,
          name: selection.name.value,
          alias: selection.alias?.value,
          factoryName: selection.alias?.value ?? selection.name.value,
          type: type,
          selections: undefined,
        };
      }
    }
  }

  private getPossibleTypes(
    selections: NormalizedSelection[]
  ): GraphQLObjectType[] {
    const selection = selections[selections.length - 1];
    const parents = selections.slice(0, -1);

    if (selection.selections) {
      if (
        selection.kind === Kind.FIELD ||
        selection.kind === Kind.OPERATION_DEFINITION
      ) {
        return getPossibleTypes(this.schema, getBaseType(selection.type));
      }

      if (selection.typeCondition) {
        return getPossibleTypes(this.schema, selection.typeCondition);
      }
    }

    return this.getPossibleTypes(parents);
  }

  private generateFactories(selections: NormalizedSelection[] = []): string[] {
    const selection = selections[selections.length - 1];

    if (selection.selections == null) {
      return [];
    }

    const factoryName = selections
      .map(({ factoryName }) => factoryName)
      .join("_");
    const possibleTypes = this.getPossibleTypes(selections);

    return [
      print([
        `export function ${factoryName}(props) {`,
        [
          `switch(props.__typename) {`,
          ...possibleTypes.map((possibleType) => {
            const selectionsForType = (
              selection.selections as Array<
                Exclude<
                  NormalizedSelection,
                  { kind: Kind.OPERATION_DEFINITION }
                >
              >
            ).filter(
              (childSelection) =>
                childSelection.kind === Kind.FIELD ||
                childSelection.typeCondition == null ||
                childSelection.typeCondition.name === possibleType.name
            );
            const scalars = selectionsForType.filter(
              (childSelection): childSelection is NormalizedScalarField =>
                childSelection.selections == null
            );
            return [
              `case "${possibleType.name}": {`,
              [
                `const { ${scalars
                  .map((n) => (n.alias ? `${n.name}: ${n.alias}` : n.name))
                  .join(", ")} } = factories.${this.convertFactoryName(
                  possibleType.name
                )}({ ${scalars
                  .map((n) => `${n.name}: props.${n.alias ?? n.name}`)
                  .join(", ")} });`,
                `return { ${selectionsForType
                  .map((childSelection) => {
                    if (childSelection.kind === Kind.FIELD) {
                      if (childSelection.selections == null) {
                        return childSelection.name;
                      }
                      return `${childSelection.name}: ${selections
                        .concat(childSelection)
                        .map(({ factoryName }) => factoryName)
                        .join("_")}({})`;
                    }
                    return `...${selections
                      .concat(childSelection)
                      .map(({ factoryName }) => factoryName)
                      .join("_")}({})`;
                  })
                  .concat([`...props`])
                  .join(", ")} };`,
              ],
              `}`,
            ];
          }),
          [
            `case undefined:`,
            `default:`,
            [
              `return ${factoryName}({ ...props, __typename: "${possibleTypes[0]}" });`,
            ],
          ],
          `}`,
        ],
        `}`,
      ]),
      ...selection.selections.flatMap((childSelection) =>
        this.generateFactories(selections.concat(childSelection))
      ),
    ];
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    const type = this.schema.getRootType(node.operation);

    if (type == null) {
      throw new Error(`Operation root type not found for "${node.operation}"`);
    }

    return this.generateFactories([
      this.normalizeSelectionNode(type, node),
    ]).join("\n");
  }
}
