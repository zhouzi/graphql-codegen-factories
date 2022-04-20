import { getBaseType } from "@graphql-codegen/plugin-helpers";
import {
  DeclarationBlock,
  getPossibleTypes,
  indent,
} from "@graphql-codegen/visitor-plugin-common";
import {
  FieldNode,
  FragmentDefinitionNode,
  GraphQLCompositeType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLSchema,
  isInterfaceType,
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

  private generateFactories(
    fields: Array<{ name: string; type: GraphQLCompositeType }>,
    selections: readonly SelectionNode[]
  ): string[] {
    const field = fields[fields.length - 1];
    const possibleTypes = getPossibleTypes(this.schema, field.type);
    const flatSelections = this.flattenSelections(selections);

    return [
      new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind("function")
        .withName(
          `${fields
            .map((otherField) => otherField.name)
            .join("_")}({ __typename = "${
            possibleTypes[0].name
          }", ...props }: ${possibleTypes
            .map((possibleType) => `DeepPartial<${possibleType.name}>`)
            .join(" | ")})`
        )
        .withBlock(
          [
            indent(`switch(__typename) {`),
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
                      )}(props);`
                    )
                  )
                ),
                indent(
                  indent(
                    indent(
                      `return { ${flatSelectionsForType
                        .map((selection) => {
                          const name =
                            selection.field.alias?.value ??
                            selection.field.name.value;

                          return selection.field.selectionSet
                            ? `${name}: ${fields
                                .map((otherField) => otherField.name)
                                .concat([name])
                                .join("_")}(props.${name} ?? {})`
                            : name;
                        })
                        .join(", ")} };`
                    )
                  )
                ),
                indent(indent(`}`)),
              ];
            }),
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
          const baseType = getBaseType(fieldType.type) as GraphQLCompositeType;

          return acc.concat(
            this.generateFactories(
              fields.concat({
                name:
                  selection.field.alias?.value ?? selection.field.name.value,
                type: baseType,
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

    return this.generateFactories(
      [
        {
          name: type.name,
          type: type,
        },
      ],
      node.selectionSet.selections
    ).join("\n");
  }
}
