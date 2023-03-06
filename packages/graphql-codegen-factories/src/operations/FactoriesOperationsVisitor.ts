import path from "path";
import { getBaseType } from "@graphql-codegen/plugin-helpers";
import { getConfigValue } from "@graphql-codegen/visitor-plugin-common";
import { camelCase, pascalCase } from "change-case-all";
import {
  FragmentDefinitionNode,
  GraphQLCompositeType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
  isInterfaceType,
  isListType,
  isNonNullType,
  isUnionType,
  Kind,
  OperationDefinitionNode,
  SelectionNode,
} from "graphql";
import {
  FactoriesBaseVisitor,
  FactoriesBaseVisitorParsedConfig,
  FactoriesBaseVisitorRawConfig,
} from "../FactoriesBaseVisitor";

export interface FactoriesOperationsVisitorRawConfig
  extends FactoriesBaseVisitorRawConfig {
  schemaFactoriesPath?: string;
  namespacedSchemaFactoriesImportName?: string;
}

export interface FactoriesOperationsVisitorParsedConfig
  extends FactoriesBaseVisitorParsedConfig {
  schemaFactoriesPath: string;
  namespacedSchemaFactoriesImportName: string;
}

interface NormalizedSelection {
  name: string;
  alias: string | undefined;
  typeCondition: GraphQLCompositeType;
  type: GraphQLOutputType;
  selections: Record<string, NormalizedSelection[]> | undefined;
}
interface SelectionAncestor {
  selection: NormalizedSelection;
  typeCondition: string | undefined;
}

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
    config: FactoriesOperationsVisitorRawConfig,
    outputFile: string | undefined
  ) {
    const parsedConfig = {
      schemaFactoriesPath: getConfigValue(
        config.schemaFactoriesPath,
        undefined
      ),
      namespacedSchemaFactoriesImportName: getConfigValue(
        config.namespacedSchemaFactoriesImportName,
        undefined
      ),
    } as FactoriesOperationsVisitorParsedConfig;

    if (parsedConfig.schemaFactoriesPath && outputFile) {
      const outputDirectory = path.dirname(outputFile);
      const schemaFactoriesPath = path.resolve(
        process.cwd(),
        parsedConfig.schemaFactoriesPath
      );
      const relativeFactoriesPath = path.relative(
        outputDirectory,
        schemaFactoriesPath
      );

      // If the factories are located in the same directory as the file,
      // the path will look like "generated/factories.ts"  instead of "./generated/factories.ts".
      // So we need to add the ./ at the beginning in this case.
      parsedConfig.schemaFactoriesPath = relativeFactoriesPath.startsWith(".")
        ? relativeFactoriesPath
        : `./${relativeFactoriesPath}`;
    }

    if (
      parsedConfig.schemaFactoriesPath &&
      parsedConfig.namespacedSchemaFactoriesImportName == null
    ) {
      parsedConfig.namespacedSchemaFactoriesImportName = "schemaFactories";
    }

    super(config, parsedConfig);

    this.schema = schema;
    this.fragments = fragments;
  }

  private convertNameWithFactoriesNamespace(name: string) {
    return this.config.namespacedSchemaFactoriesImportName
      ? `${this.config.namespacedSchemaFactoriesImportName}.${name}`
      : name;
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

    if (this.config.schemaFactoriesPath) {
      imports.push(
        `import * as ${
          this.config.namespacedSchemaFactoriesImportName
        } from "${this.config.schemaFactoriesPath.replace(
          /\.(js|ts|d.ts)$/,
          ""
        )}";`
      );
    }

    return imports;
  }

  private groupSelections(
    selections: NormalizedSelection[]
  ): Record<string, NormalizedSelection[]> {
    return selections
      .filter(
        (selection, index, selections) =>
          selections.findIndex(
            (otherSelection) =>
              otherSelection.alias === selection.alias &&
              otherSelection.name === selection.name &&
              otherSelection.typeCondition.name === selection.typeCondition.name
          ) === index
      )
      .reduce<Record<string, NormalizedSelection[]>>((acc, selection) => {
        acc[selection.typeCondition.name] = (
          acc[selection.typeCondition.name] ?? []
        ).concat(selection);
        return acc;
      }, {});
  }

  private normalizeSelection(
    parent: GraphQLCompositeType,
    selection: OperationDefinitionNode | SelectionNode
  ): NormalizedSelection[] {
    if (selection.kind === Kind.OPERATION_DEFINITION) {
      const operationSuffix = this.getOperationSuffix(
        selection,
        pascalCase(selection.operation)
      );
      const name = this.convertName(this.handleAnonymousOperation(selection), {
        suffix: operationSuffix,
      });

      return [
        {
          name: name,
          alias: this.convertFactoryName(name),
          typeCondition: parent,
          type: parent,
          selections: this.groupSelections(
            selection.selectionSet.selections.flatMap((selection) =>
              this.normalizeSelection(parent, selection)
            )
          ),
        },
      ];
    }

    if (selection.kind === Kind.FIELD) {
      const type = (parent as GraphQLObjectType).getFields()[
        selection.name.value
      ].type;
      return [
        {
          name: selection.name.value,
          alias: selection.alias?.value,
          typeCondition: parent,
          type: type,
          selections:
            selection.selectionSet == null
              ? undefined
              : this.groupSelections(
                  selection.selectionSet.selections.flatMap((childSelection) =>
                    this.normalizeSelection(
                      getBaseType(type) as GraphQLCompositeType,
                      childSelection
                    )
                  )
                ),
        },
      ];
    }

    let typeCondition = parent;
    let selections: readonly SelectionNode[] = [];

    if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = this.fragments.find(
        (otherFragment) => otherFragment.name.value === selection.name.value
      );

      if (fragment == null) {
        throw new Error(`Fragment "${selection.name.value}" not found`);
      }

      const newTypeCondition = this.schema.getType(
        fragment.typeCondition.name.value
      ) as GraphQLObjectType | GraphQLInterfaceType | undefined;

      if (newTypeCondition == null) {
        throw new Error(
          `Fragment "${fragment.name.value}"'s type condition "${fragment.typeCondition.name.value}" not found`
        );
      }

      typeCondition = newTypeCondition;
      selections = fragment.selectionSet.selections;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      if (selection.typeCondition) {
        const newTypeCondition = this.schema.getType(
          selection.typeCondition.name.value
        ) as GraphQLObjectType | GraphQLInterfaceType | undefined;

        if (newTypeCondition == null) {
          throw new Error(
            `Inline fragment's type condition "${selection.typeCondition.name.value}" not found`
          );
        }

        typeCondition = newTypeCondition;
      }

      selections = selection.selectionSet.selections;
    }

    let typeConditions = [typeCondition];

    if (isInterfaceType(typeCondition)) {
      typeConditions = isUnionType(parent)
        ? parent
            .getTypes()
            .filter((type) =>
              type
                .getInterfaces()
                .some((inter) => inter.name === typeCondition.name)
            )
        : [parent];
    }

    return typeConditions.flatMap((otherTypeCondition) =>
      selections.flatMap((childSelection) =>
        this.normalizeSelection(otherTypeCondition, childSelection)
      )
    );
  }

  private convertOperationFactoryName(ancestors: SelectionAncestor[]): string {
    return ancestors
      .flatMap(({ selection, typeCondition }) => [
        selection.alias ?? selection.name,
        ...(isUnionType(getBaseType(selection.type)) && typeCondition
          ? [typeCondition]
          : []),
      ])
      .join("_");
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
      ? `NonNullable<${returnType}>`
      : returnType;

    if (isListType(type)) {
      return this.wrapWithModifiers(
        `${updatedReturnType}[number]`,
        type.ofType
      );
    }

    return updatedReturnType;
  }

  private getReturnType([
    { selection: operation },
    ...selections
  ]: SelectionAncestor[]): string {
    return selections.reduce((acc, { selection, typeCondition }) => {
      const withModifiers = this.wrapWithModifiers(
        `${acc}["${selection.name}"]`,
        selection.type
      );
      return isUnionType(getBaseType(selection.type)) && typeCondition
        ? `Extract<${withModifiers} & { __typename: "${typeCondition}" }, { __typename: "${typeCondition}" }>`
        : withModifiers;
    }, operation.name);
  }

  private generateFactories(
    selection: NormalizedSelection,
    ancestors: SelectionAncestor[] = []
  ): string[] {
    if (selection.selections == null) {
      return [];
    }

    const factories: string[] = [];

    if (isUnionType(getBaseType(selection.type))) {
      const futureAncestors = ancestors.concat({
        selection,
        typeCondition: undefined,
      });
      const factoryName = this.convertOperationFactoryName(futureAncestors);
      const returnType = this.getReturnType(futureAncestors);
      const typeConditions = Object.keys(selection.selections);
      const defaultTypeCondition = typeConditions[0];

      factories.push(
        this.print([
          `export function ${factoryName}(props: Partial<${returnType}> = {}): ${returnType} {`,
          [
            `switch(props.__typename) {`,
            ...typeConditions.map((typeCondition) => [
              `case "${typeCondition}":`,
              [
                `return ${this.convertOperationFactoryName(
                  ancestors.concat({ selection, typeCondition })
                )}(props);`,
              ],
            ]),
            [
              `case undefined:`,
              `default:`,
              [
                `return ${factoryName}({ ...props, __typename: "${defaultTypeCondition}" })`,
              ],
            ],
            `}`,
          ],
          `}`,
        ])
      );
    }

    Object.entries(selection.selections).forEach(
      ([typeCondition, childSelections]) => {
        const futureAncestors = ancestors.concat({ selection, typeCondition });
        const factoryName = this.convertOperationFactoryName(futureAncestors);
        const returnType = this.getReturnType(futureAncestors);
        const objectVarName = camelCase(typeCondition);
        const scalars = childSelections.filter(
          (childSelection) => childSelection.selections == null
        );

        factories.push(
          this.print([
            `export function ${factoryName}(props: Partial<${returnType}> = {}): ${returnType} {`,
            [
              ...(scalars.length > 0
                ? [
                    `const ${objectVarName} = ${this.convertNameWithFactoriesNamespace(
                      this.convertFactoryName(typeCondition)
                    )}({`,
                    scalars.map(
                      (scalar) =>
                        `${scalar.name}: props.${scalar.alias ?? scalar.name},`
                    ),
                    `});`,
                  ]
                : []),
              `return {`,
              [
                `__typename: "${typeCondition}",`,
                ...childSelections.map((childSelection) => {
                  let value = `${objectVarName}.${childSelection.name}`;

                  if (childSelection.selections) {
                    if (isNonNullType(childSelection.type)) {
                      value = isListType(childSelection.type.ofType)
                        ? "[]"
                        : `${this.convertOperationFactoryName(
                            futureAncestors.concat({
                              selection: childSelection,
                              typeCondition,
                            })
                          )}({})`;
                    } else {
                      value = "null";
                    }
                  }

                  return `${
                    childSelection.alias ?? childSelection.name
                  }: ${value},`;
                }),
                `...props,`,
              ],
              `};`,
            ],
            `}`,
          ])
        );

        childSelections.forEach((childSelection) => {
          if (childSelection.selections) {
            factories.push(
              ...this.generateFactories(childSelection, futureAncestors)
            );
          }
        });
      }
    );

    return factories;
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    const rootType = this.schema.getRootType(node.operation);

    if (rootType == null) {
      throw new Error(`Root type "${node.operation}" not found`);
    }

    return this.normalizeSelection(rootType, node)
      .flatMap((selection) => this.generateFactories(selection))
      .join("\n\n");
  }
}
