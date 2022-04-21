import { getBaseType } from "@graphql-codegen/plugin-helpers";
import {
  DeclarationBlock,
  getPossibleTypes,
  indent,
} from "@graphql-codegen/visitor-plugin-common";
import { pascalCase } from "change-case-all";
import {
  FieldNode,
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
import { FactoriesBaseVisitorRawConfig } from "../FactoriesBaseVisitor";
import { FactoriesBaseVisitor } from "../FactoriesBaseVisitor";

interface FieldSelection {
  field: FieldNode;
  conditions: Array<GraphQLInterfaceType | GraphQLObjectType>;
}

type Modifier =
  | { kind: "List" }
  | { kind: "Nullable" }
  | { kind: "Extract"; __typename: string };

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

  private flattenSelections(
    selections: readonly SelectionNode[],
    conditions: Array<GraphQLInterfaceType | GraphQLObjectType> = []
  ): FieldSelection[] {
    return selections.flatMap((selection) => {
      switch (selection.kind) {
        case Kind.FIELD:
          return { field: selection, conditions };
        case Kind.INLINE_FRAGMENT:
          return this.flattenSelections(
            selection.selectionSet.selections,
            selection.typeCondition
              ? conditions.concat(
                  // inline fragments' "on" clause can only be used with an interface or object
                  this.schema.getType(selection.typeCondition.name.value) as
                    | GraphQLInterfaceType
                    | GraphQLObjectType
                )
              : conditions
          );
        case Kind.FRAGMENT_SPREAD: {
          const fragment = this.fragments.find(
            (otherFragment) => otherFragment.name.value === selection.name.value
          );
          return fragment
            ? this.flattenSelections(
                fragment.selectionSet.selections,
                conditions.concat(
                  // fragments' "on" clause can only be used with an interface or object
                  this.schema.getType(fragment.typeCondition.name.value) as
                    | GraphQLInterfaceType
                    | GraphQLObjectType
                )
              )
            : [];
        }
      }
    });
  }

  private getModifiers(
    type: GraphQLOutputType,
    onType: GraphQLInterfaceType | GraphQLObjectType | undefined,
    modifiers: Modifier[] = [],
    isNullable = true
  ): Modifier[] {
    if (isNonNullType(type)) {
      return this.getModifiers(type.ofType, onType, modifiers, false);
    }

    const updatedModifiers = isNullable
      ? modifiers.concat([{ kind: "Nullable" }])
      : modifiers;

    if (isListType(type)) {
      return this.getModifiers(
        type.ofType,
        onType,
        updatedModifiers.concat([{ kind: "List" }])
      );
    }

    if (isUnionType(type)) {
      return updatedModifiers.concat([
        { kind: "Extract", __typename: onType!.name },
      ]);
    }

    return updatedModifiers.slice().reverse();
  }

  private wrapWithModifiers(
    parent: string,
    type: GraphQLOutputType,
    onType: GraphQLInterfaceType | GraphQLObjectType | undefined
  ) {
    return this.getModifiers(type, onType).reduce((acc, modifier) => {
      switch (modifier.kind) {
        case "Nullable":
          return `NonNull<${acc}>`;
        case "List":
          return `${acc}[number]`;
        case "Extract":
          return `Extract<${acc}, { __typename: "${modifier.__typename}" }>`;
        default:
          return acc;
      }
    }, parent);
  }

  private getReturnType([head, ...tail]: Array<{
    name: string;
    type: GraphQLOutputType;
    onType: GraphQLInterfaceType | GraphQLObjectType | undefined;
  }>): string {
    return tail.reduce(
      (acc, field) =>
        this.wrapWithModifiers(
          `${acc}["${field.name}"]`,
          field.type,
          field.onType
        ),
      head.name
    );
  }

  private generateFactories(
    fields: Array<{
      name: string;
      type: GraphQLOutputType;
      onType: GraphQLInterfaceType | GraphQLObjectType | undefined;
    }>,
    selections: readonly SelectionNode[]
  ): string[] {
    const field = fields[fields.length - 1];
    const baseType = getBaseType(field.type) as GraphQLCompositeType;
    const possibleTypes = getPossibleTypes(this.schema, baseType);
    const flatSelections = this.flattenSelections(selections);

    // the conditions must appear in the names
    // to disambiguate unions with shared properties
    const factoryName = fields
      .map((otherField, index) =>
        index === 0 ? this.convertFactoryName(otherField.name) : otherField.name
      )
      .join("_");

    const returnType = this.getReturnType(fields);

    return [
      new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind("function")
        .withName(
          `${factoryName}(props: Partial<${returnType}>): ${returnType}`
        )
        .withBlock(
          [
            indent(`switch(props.__typename) {`),
            ...possibleTypes.flatMap((possibleType) => {
              const flatSelectionsForType = flatSelections.filter((selection) =>
                selection.conditions.every((condition) => {
                  if (isInterfaceType(condition)) {
                    return this.schema
                      .getImplementations(condition)
                      .objects.some(
                        (implementation) =>
                          implementation.name === possibleType.name
                      );
                  }

                  return condition.name === possibleType.name;
                })
              );
              return [
                indent(indent(`case "${possibleType.name}": {`)),
                indent(
                  indent(
                    indent(
                      `const { ${flatSelectionsForType
                        .filter(
                          (selection) => selection.field.selectionSet == null
                        )
                        .map((selection) =>
                          selection.field.alias
                            ? `${selection.field.name.value}: ${selection.field.alias.value}`
                            : selection.field.name.value
                        )
                        .join(", ")} } = factories.${this.convertFactoryName(
                        possibleType.name
                      )}({ ${flatSelectionsForType
                        .filter(
                          (selection) => selection.field.selectionSet == null
                        )
                        .map(
                          (selection) =>
                            `${selection.field.name.value}: props.${
                              selection.field.alias?.value ??
                              selection.field.name.value
                            }`
                        )
                        .join(", ")} });`
                    )
                  )
                ),
                indent(
                  indent(
                    indent(
                      `return { ${flatSelectionsForType
                        .map((selection) => {
                          const fieldName =
                            selection.field.alias?.value ??
                            selection.field.name.value;

                          return selection.field.selectionSet
                            ? `${fieldName}: ${[factoryName, fieldName].join(
                                "_"
                              )}(props.${fieldName} ?? {})`
                            : fieldName;
                        })
                        .join(", ")} };`
                    )
                  )
                ),
                indent(indent(`}`)),
              ];
            }),
            indent(indent(`case undefined:`)),
            indent(indent(`default:`)),
            indent(
              indent(
                indent(
                  `return ${factoryName}({ ...props, __typename: "${possibleTypes[0].name}" });`
                )
              )
            ),
            indent(`}`),
          ]
            .filter(Boolean)
            .join("\n")
        ).string,
    ].concat(
      flatSelections.reduce<string[]>((acc, selection) => {
        if (selection.field.selectionSet) {
          const type =
            selection.conditions[selection.conditions.length - 1] ??
            possibleTypes[0];
          const fieldType = type.getFields()[selection.field.name.value];

          return acc.concat(
            this.generateFactories(
              fields.concat({
                name:
                  selection.field.alias?.value ?? selection.field.name.value,
                type: fieldType.type,
                onType: type,
              }),
              selection.field.selectionSet.selections
            )
          );
        }

        return acc;
      }, [])
    );
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    const type = this.schema.getRootType(node.operation);

    if (type == null) {
      throw new Error(`Operation root type not found for "${node.operation}"`);
    }

    const name = this.handleAnonymousOperation(node);
    const operationType = pascalCase(node.operation);
    const operationTypeSuffix = this.getOperationSuffix(name, operationType);

    return this.generateFactories(
      [
        {
          name: this.convertName(name, {
            suffix: operationTypeSuffix,
          }),
          type,
          onType: undefined,
        },
      ],
      node.selectionSet.selections
    ).join("\n");
  }
}
