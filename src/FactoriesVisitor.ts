import {
  GraphQLSchema,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  GraphQLEnumType,
  NamedTypeNode,
  NonNullTypeNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
} from "graphql";
import {
  BaseVisitor,
  RawTypesConfig,
  ParsedTypesConfig,
  DeclarationBlock,
  indent,
  getConfigValue,
} from "@graphql-codegen/visitor-plugin-common";

export interface FactoriesVisitorRawConfig extends RawTypesConfig {
  enumsAsTypes?: boolean;
  factoryName?: string;
  scalarDefaults?: Record<string, string>;
}

interface FactoriesVisitorParsedConfig extends ParsedTypesConfig {
  enumsAsTypes: boolean;
  factoryName: string;
  scalarDefaults: Record<string, string>;
}

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
    super(config, {
      enumsAsTypes: getConfigValue(config.enumsAsTypes, false),
      factoryName: getConfigValue(config.factoryName, "create{Type}Mock"),
      scalarDefaults: getConfigValue(config.scalarDefaults, {}),
    } as FactoriesVisitorParsedConfig);

    this.enums = Object.values(schema.getTypeMap()).reduce((acc, type) => {
      if (type instanceof GraphQLEnumType) {
        return Object.assign(acc, {
          [type.name]: type,
        });
      }
      return acc;
    }, {});
  }

  private getDefaultValue(name: string): string {
    if (this.config.scalarDefaults.hasOwnProperty(name)) {
      return this.config.scalarDefaults[name];
    }

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
        if (this.enums.hasOwnProperty(name)) {
          return this.config.enumsAsTypes
            ? `"${this.enums[name].getValues()[0].value}"`
            : `${name}.${this.convertName(
                this.enums[name].getValues()[0].name,
                {
                  transformUnderscore: true,
                }
              )}`;
        }

        return `${this.convertFactoryName(this.convertName(name))}({})`;
      }
    }
  }

  private convertFactoryName(name: string): string {
    return this.config.factoryName.replace("{Type}", name);
  }

  private convertField(
    node: FieldDefinitionNode | InputValueDefinitionNode
  ): string {
    const { defaultValue, isNullable } = (node.type as any) as TypeValue;
    return indent(
      indent(`${node.name.value}: ${isNullable ? "null" : defaultValue},`)
    );
  }

  private convertObjectType(
    node: ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode
  ): string {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind("function")
      .withName(
        `${this.convertFactoryName(
          this.convertName(node)
        )}(props: Partial<${this.convertName(node)}>): ${this.convertName(
          node
        )}`
      )
      .withBlock(
        [
          indent("return {"),
          node.kind === "ObjectTypeDefinition"
            ? indent(indent(`__typename: "${node.name.value}",`))
            : null,
          ...(node.fields ?? []),
          indent(indent("...props,")),
          indent("};"),
        ]
          .filter(Boolean)
          .join("\n")
      ).string;
  }

  NamedType(node: NamedTypeNode): TypeValue {
    return {
      defaultValue: this.getDefaultValue(node.name.value),
      isNullable: true,
    };
  }

  ListType(): TypeValue {
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
    return this.convertField(node);
  }

  EnumTypeDefinition(): string {
    return "";
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    return this.convertObjectType(node);
  }

  InputValueDefinition(node: InputValueDefinitionNode): string {
    return this.convertField(node);
  }

  ScalarTypeDefinition(): string {
    return "";
  }

  InterfaceTypeDefinition(): string {
    return "";
  }

  UnionTypeDefinition(): string {
    return "";
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    if (["Query", "Mutation"].includes(node.name.value)) {
      return "";
    }

    return this.convertObjectType(node);
  }
}
