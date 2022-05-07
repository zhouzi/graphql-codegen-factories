import {
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  NamedTypeNode,
  NonNullTypeNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  UnionTypeDefinitionNode,
  ListTypeNode,
  GraphQLEnumType,
  GraphQLUnionType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLSchema,
  isEnumType,
  isUnionType,
  isInterfaceType,
  isObjectType,
} from "graphql";
import {
  DeclarationBlock,
  getConfigValue,
  indent,
} from "@graphql-codegen/visitor-plugin-common";
import {
  FactoriesBaseVisitor,
  FactoriesBaseVisitorParsedConfig,
  FactoriesBaseVisitorRawConfig,
} from "../FactoriesBaseVisitor";

export interface FactoriesSchemaVisitorRawConfig
  extends FactoriesBaseVisitorRawConfig {
  scalarDefaults?: Record<string, string>;

  // the typescript plugin's options that we need to support explicitly:
  enumsAsTypes?: boolean;

  // injected by near-operation-file and import-types presets:
  namespacedImportName?: string;

  // the "import * as Types" statement is not injected by near-operation-file and import-types
  // without a list of documents, as reported in: https://github.com/dotansimha/graphql-code-generator/issues/5775
  // until this is fixed, the following option prepends it and fills namespacedImportName
  //
  // typesPath is also the name of the option used by the import-types presets
  // near-operation-file uses baseTypesPath but that's because it generates multiple files
  // and it needs to generate relative paths
  typesPath?: string;

  // the following option does the same thing as namespacedImportName
  // but it is injected automatically while this one is provided by the user
  importTypesNamespace?: string;
}

export interface FactoriesSchemaVisitorParsedConfig
  extends FactoriesBaseVisitorParsedConfig {
  enumsAsTypes: boolean;
  scalarDefaults: Record<string, string>;
  namespacedImportName: string | null;
  typesPath?: string;
  importTypesNamespace?: string;
}

interface VisitedTypeNode {
  typename: string;
  defaultValue: string;
  isNullable: boolean;
}

interface UnvisitedFieldDefinitionNode
  extends Omit<FieldDefinitionNode, "type"> {
  type: VisitedTypeNode;
}

interface UnvisitedInputValueDefinitionNode
  extends Omit<InputValueDefinitionNode, "type"> {
  type: VisitedTypeNode;
}

interface UnvisitedNonNullTypeNode extends Omit<NonNullTypeNode, "type"> {
  type: VisitedTypeNode;
}

interface UnvisitedUnionTypeDefinitionNode
  extends Omit<UnionTypeDefinitionNode, "types"> {
  types: VisitedTypeNode[];
}

interface UnvisitedListTypeNode extends Omit<ListTypeNode, "type"> {
  type: VisitedTypeNode;
}

export class FactoriesSchemaVisitor extends FactoriesBaseVisitor<
  FactoriesSchemaVisitorRawConfig,
  FactoriesSchemaVisitorParsedConfig
> {
  protected enums: Record<string, GraphQLEnumType>;
  protected unions: Record<string, GraphQLUnionType>;
  protected interfaces: Record<
    string,
    {
      interface: GraphQLInterfaceType | null;
      implementations: GraphQLObjectType[];
    }
  >;

  constructor(schema: GraphQLSchema, config: FactoriesSchemaVisitorRawConfig) {
    const parsedConfig = {
      enumsAsTypes: getConfigValue(config.enumsAsTypes, false),
      scalarDefaults: getConfigValue(config.scalarDefaults, {}),
      namespacedImportName: getConfigValue(
        config.namespacedImportName,
        undefined
      ),
      typesPath: getConfigValue(config.typesPath, undefined),
      importTypesNamespace: getConfigValue(
        config.importTypesNamespace,
        undefined
      ),
    } as FactoriesSchemaVisitorParsedConfig;

    if (parsedConfig.typesPath && parsedConfig.namespacedImportName == null) {
      parsedConfig.namespacedImportName =
        parsedConfig.importTypesNamespace ?? "Types";
    }

    super(config, parsedConfig);

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

  public getImports() {
    const imports: string[] = [];

    if (this.config.typesPath) {
      imports.push(
        `import * as ${this.config.namespacedImportName} from '${this.config.typesPath}';\n`
      );
    }

    return imports;
  }

  protected convertNameWithTypesNamespace(name: string) {
    return this.convertNameWithNamespace(
      name,
      this.config.namespacedImportName ?? undefined
    );
  }

  protected convertObjectType(
    node: ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode
  ): string {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind("function")
      .withName(
        `${this.convertFactoryName(
          node
        )}(props: Partial<${this.convertNameWithTypesNamespace(
          node.name.value
        )}> = {}): ${this.convertNameWithTypesNamespace(node.name.value)}`
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

  protected convertField(
    node: UnvisitedFieldDefinitionNode | UnvisitedInputValueDefinitionNode
  ): string {
    const { defaultValue, isNullable } = node.type;
    return indent(
      indent(`${node.name.value}: ${isNullable ? "null" : defaultValue},`)
    );
  }

  protected getDefaultValue(nodeName: string): string {
    const scalarName =
      nodeName in this.unions
        ? // Take the first type from an union
          this.unions[nodeName].getTypes()[0].name
        : nodeName in this.interfaces
        ? // Take the first implementation from an interface
          this.interfaces[nodeName].implementations[0].name
        : nodeName;

    if (scalarName in this.config.scalarDefaults) {
      return this.config.scalarDefaults[scalarName];
    }

    switch (scalarName) {
      case "Int":
      case "Float":
        return "0";
      case "ID":
      case "String":
        return '""';
      case "Boolean":
        return "false";
      default: {
        if (scalarName in this.enums) {
          return this.config.enumsAsTypes
            ? `"${this.enums[scalarName].getValues()[0].value}"`
            : `${this.convertNameWithTypesNamespace(
                scalarName
              )}.${this.convertName(
                this.enums[scalarName].getValues()[0].name,
                {
                  transformUnderscore: true,
                }
              )}`;
        }

        return `${this.convertFactoryName(scalarName)}({})`;
      }
    }
  }

  NamedType(node: NamedTypeNode): VisitedTypeNode {
    return {
      typename: node.name.value,
      defaultValue: this.getDefaultValue(node.name.value),
      isNullable: true,
    };
  }

  ListType(node: UnvisitedListTypeNode): VisitedTypeNode {
    return {
      typename: node.type.typename,
      defaultValue: "[]",
      isNullable: true,
    };
  }

  NonNullType(node: UnvisitedNonNullTypeNode): VisitedTypeNode {
    return {
      ...node.type,
      isNullable: false,
    };
  }

  FieldDefinition(node: UnvisitedFieldDefinitionNode): string {
    return this.convertField(node);
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    return this.convertObjectType(node);
  }

  InputValueDefinition(node: UnvisitedInputValueDefinitionNode): string {
    return this.convertField(node);
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string | undefined {
    return this.convertObjectType(node);
  }

  UnionTypeDefinition(
    node: UnvisitedUnionTypeDefinitionNode
  ): string | undefined {
    const types = node.types ?? [];

    if (types.length <= 0) {
      // Creating an union that represents nothing is valid
      // So this is valid:
      // union Humanoid = Human | Droid
      // But this is also valid:
      // union Humanoid
      return undefined;
    }

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind("function")
      .withName(
        `${this.convertFactoryName(
          node.name.value
        )}(props: Partial<${this.convertNameWithTypesNamespace(
          node.name.value
        )}> = {}): ${this.convertNameWithTypesNamespace(node.name.value)}`
      )
      .withBlock(
        [
          indent("switch(props.__typename) {"),
          ...types.flatMap((type) => [
            indent(indent(`case "${type.typename}":`)),
            indent(
              indent(
                indent(
                  `return ${this.convertFactoryName(type.typename)}(props);`
                )
              )
            ),
          ]),
          indent(indent(`case undefined:`)),
          indent(indent(`default:`)),
          indent(
            indent(
              indent(
                `return ${this.convertFactoryName(
                  node.name.value
                )}({ __typename: "${types[0].typename}", ...props });`
              )
            )
          ),
          indent("}"),
        ]
          .filter(Boolean)
          .join("\n")
      ).string;
  }
}
