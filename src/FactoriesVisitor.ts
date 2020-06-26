import {
  GraphQLSchema,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  GraphQLEnumType,
  NamedTypeNode,
  ListTypeNode,
  NonNullTypeNode,
  InputObjectTypeDefinitionNode,
} from "graphql";
import {
  BaseVisitor,
  RawTypesConfig,
  ParsedTypesConfig,
  DeclarationBlock,
  indent,
} from "@graphql-codegen/visitor-plugin-common";

export interface FactoriesVisitorRawConfig extends RawTypesConfig {}

interface FactoriesVisitorParsedConfig extends ParsedTypesConfig {}

interface TypeValue {
  defaultValue: string;
  isNullable: boolean;
}

export class FactoriesVisitor extends BaseVisitor<
  FactoriesVisitorRawConfig,
  FactoriesVisitorParsedConfig
> {
  private enums: Record<string, GraphQLEnumType>;

  constructor(schema: GraphQLSchema, config: FactoriesVisitorRawConfig) {
    super(config, {} as FactoriesVisitorParsedConfig);

    this.enums = Object.values(schema.getTypeMap()).reduce((acc, type) => {
      if (type instanceof GraphQLEnumType) {
        return Object.assign(acc, {
          [type.name]: type,
        });
      }
      return acc;
    }, {});
  }

  NamedType(node: NamedTypeNode): TypeValue {
    return {
      defaultValue: this.getNamedTypeDefaultValue(node.name.value),
      isNullable: true,
    };
  }

  private getNamedTypeDefaultValue(name: string): string {
    switch (name) {
      case "Int":
      case "Float":
        return "0";
      case "ID":
      case "String":
        return '""';
      case "Boolean":
        return "false";
      default: {
        return this.enums.hasOwnProperty(name)
          ? `${name}.${this.enums[name].getValues()[0].name}`
          : `create${this.convertName(name)}({})`;
      }
    }
  }

  ListType(node: ListTypeNode): TypeValue {
    return {
      defaultValue: "[]",
      isNullable: true,
    };
  }

  NonNullType(node: NonNullTypeNode): TypeValue {
    return {
      ...((node.type as any) as TypeValue),
      isNullable: false,
    };
  }

  FieldDefinition(node: FieldDefinitionNode): string {
    const { defaultValue, isNullable } = (node.type as any) as TypeValue;
    return indent(
      indent(`${node.name.value}: ${isNullable ? "null" : defaultValue},`)
    );
  }

  EnumTypeDefinition(): string {
    return "";
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    return "";
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    if (["Query", "Mutation"].includes(node.name.value)) {
      return "";
    }

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind("function")
      .withName(
        `create${this.convertName(node)}(props: Partial<${this.convertName(
          node
        )}>): ${this.convertName(node)}`
      )
      .withBlock(
        [
          indent("return {"),
          indent(indent(`__typename: "${this.convertName(node)}",`)),
          ...(node.fields ?? []),
          indent(indent("...props,")),
          indent("};"),
        ].join("\n")
      ).string;
  }
}
