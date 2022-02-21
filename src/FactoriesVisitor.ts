import {
  GraphQLSchema,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  GraphQLEnumType,
  NamedTypeNode,
  NonNullTypeNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  isEnumType,
  isUnionType,
  GraphQLUnionType,
  isInterfaceType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  isObjectType,
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
  namespacedImportName?: string;
}

interface FactoriesVisitorParsedConfig extends ParsedTypesConfig {
  enumsAsTypes: boolean;
  factoryName: string;
  scalarDefaults: Record<string, string>;
  namespacedImportName?: string;
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
  private unions: Record<string, GraphQLUnionType>;
  private interfaces: Record<
    string,
    {
      interface: GraphQLInterfaceType | null;
      implementations: GraphQLObjectType[];
    }
  >;

  constructor(schema: GraphQLSchema, config: FactoriesVisitorRawConfig) {
    super(config, {
      enumsAsTypes: getConfigValue(config.enumsAsTypes, false),
      factoryName: getConfigValue(config.factoryName, "create{Type}Mock"),
      scalarDefaults: getConfigValue(config.scalarDefaults, {}),
      namespacedImportName: getConfigValue(
        config.namespacedImportName,
        undefined
      ),
    } as FactoriesVisitorParsedConfig);

    this.enums = {};
    this.unions = {};
    this.interfaces = {};

    const initializeInterface = (name: string) => {
      if (this.interfaces[name] == null) {
        this.interfaces[name] = {
          interface: null,
          implementations: [],
        };
      }
    };
    Object.values(schema.getTypeMap()).forEach((type) => {
      if (isEnumType(type)) {
        this.enums[type.name] = type;
      }

      if (isUnionType(type)) {
        this.unions[type.name] = type;
      }

      if (isInterfaceType(type)) {
        initializeInterface(type.name);
        this.interfaces[type.name].interface = type;
      }

      if (isObjectType(type)) {
        type.getInterfaces().forEach((inter) => {
          initializeInterface(inter.name);
          this.interfaces[inter.name].implementations.push(type);
        });
      }
    });
  }

  private getDefaultValue(node: NamedTypeNode): string {
    const name = this.unions.hasOwnProperty(node.name.value)
      ? // The default value of an union is the first type's default value
        this.unions[node.name.value].getTypes()[0].name
      : this.interfaces.hasOwnProperty(node.name.value)
      ? // The default value of an interface is the first implementation's default value
        this.interfaces[node.name.value].implementations[0].name
      : node.name.value;

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
            : `${this.convertNameWithNamespace(name)}.${this.convertName(
                this.enums[name].getValues()[0].name,
                {
                  transformUnderscore: true,
                }
              )}`;
        }

        return `${this.convertFactoryName(name)}({})`;
      }
    }
  }

  private convertFactoryName(
    ...args: Parameters<BaseVisitor["convertName"]>
  ): string {
    const [node] = args;
    return this.config.factoryName.replace("{Type}", this.convertName(node));
  }

  private convertNameWithNamespace(
    ...args: Parameters<BaseVisitor["convertName"]>
  ) {
    const [node] = args;
    const name = this.convertName(node);

    if (this.config.namespacedImportName) {
      return `${this.config.namespacedImportName}.${name}`;
    }

    return name;
  }

  private convertField(
    node: FieldDefinitionNode | InputValueDefinitionNode
  ): string {
    const { defaultValue, isNullable } = node.type as unknown as TypeValue;
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
          node
        )}(props: Partial<${this.convertNameWithNamespace(
          node
        )}>): ${this.convertNameWithNamespace(node)}`
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
      defaultValue: this.getDefaultValue(node),
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
      ...(node.type as unknown as TypeValue),
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
