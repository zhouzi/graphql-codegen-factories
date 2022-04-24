import { getBaseType } from "@graphql-codegen/plugin-helpers";
import { getPossibleTypes } from "@graphql-codegen/visitor-plugin-common";
import { pascalCase } from "change-case-all";
import {
  FragmentDefinitionNode,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
  isListType,
  isNonNullType,
  isObjectType,
  Kind,
  OperationDefinitionNode,
  SelectionNode,
} from "graphql";
import {
  FactoriesBaseVisitor,
  FactoriesBaseVisitorParsedConfig,
  FactoriesBaseVisitorRawConfig,
} from "../FactoriesBaseVisitor";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FactoriesOperationsVisitorRawConfig
  extends FactoriesBaseVisitorRawConfig {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FactoriesOperationsVisitorParsedConfig
  extends FactoriesBaseVisitorParsedConfig {}

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

export class FactoriesOperationsVisitor extends FactoriesBaseVisitor<
  FactoriesOperationsVisitorRawConfig,
  FactoriesOperationsVisitorParsedConfig
> {
  private schema: GraphQLSchema;
  private fragments: FragmentDefinitionNode[];
  private unnamedCounter = 1;

  constructor(
    schema: GraphQLSchema,
    fragments: FragmentDefinitionNode[],
    config: FactoriesOperationsVisitorRawConfig
  ) {
    const parsedConfig = {} as FactoriesOperationsVisitorParsedConfig;

    super(config, parsedConfig);

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

  public getImports() {
    const imports: string[] = [];
    return imports;
  }

  private convertOperationFactoryName([
    operation,
    ...selections
  ]: NormalizedSelection[]): string {
    return [
      super.convertFactoryName(operation.factoryName),
      ...selections.map(({ factoryName }) => factoryName),
    ].join("_");
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
          factoryName: this.convertName(name, {
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

  private wrapWithModifiers(
    returnType: string,
    type: GraphQLOutputType,
    isNullable = true
  ): string {
    if (isNonNullType(type)) {
      return this.wrapWithModifiers(returnType, type.ofType, false);
    }

    const updatedReturnType = isNullable
      ? `NonNull<${returnType}>`
      : returnType;

    if (isListType(type)) {
      return this.wrapWithModifiers(
        `${updatedReturnType}[number]`,
        type.ofType
      );
    }

    return returnType;
  }

  private getReturnType([
    operation,
    ...selections
  ]: NormalizedSelection[]): string {
    return selections.reduce((acc, selection) => {
      if (
        selection.kind === Kind.INLINE_FRAGMENT ||
        selection.kind === Kind.FRAGMENT_SPREAD
      ) {
        if (isObjectType(selection.typeCondition)) {
          return `Extract<${acc}, { __typename: "${selection.typeCondition.name}" }>`;
        }
      }

      if (selection.kind === Kind.FIELD) {
        return this.wrapWithModifiers(
          `${acc}["${selection.factoryName}"]`,
          selection.type
        );
      }

      return acc;
    }, operation.factoryName);
  }

  private generateFactories(selections: NormalizedSelection[] = []): string[] {
    const selection = selections[selections.length - 1];

    if (selection.selections == null) {
      return [];
    }

    const factoryName = this.convertOperationFactoryName(selections);
    const possibleTypes = this.getPossibleTypes(selections);
    const returnType = this.getReturnType(selections);

    return [
      this.print([
        `export function ${factoryName}(props: Partial<${returnType}>): ${returnType} {`,
        [
          `switch(props.__typename) {`,
          ...possibleTypes.map((possibleType) => {
            const childSelections = (
              selection.selections as Array<
                Exclude<
                  NormalizedSelection,
                  { kind: Kind.OPERATION_DEFINITION }
                >
              >
            ).filter(
              (selection) =>
                selection.kind === Kind.FIELD ||
                selection.typeCondition == null ||
                selection.typeCondition.name === possibleType.name
            );
            const scalars = childSelections.filter(
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
                `return { ${childSelections
                  .map((childSelection) => {
                    if (childSelection.kind === Kind.FIELD) {
                      if (childSelection.selections == null) {
                        return childSelection.name;
                      }
                      return `${
                        childSelection.name
                      }: ${this.convertOperationFactoryName(
                        selections.concat(childSelection)
                      )}({})`;
                    }
                    return `...${this.convertOperationFactoryName(
                      selections.concat(childSelection)
                    )}({})`;
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
