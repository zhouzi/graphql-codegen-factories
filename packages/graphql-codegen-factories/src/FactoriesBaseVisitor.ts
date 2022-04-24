import {
  GraphQLSchema,
  GraphQLEnumType,
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
  getConfigValue,
  ParsedTypesConfig,
  RawTypesConfig,
} from "@graphql-codegen/visitor-plugin-common";

export interface FactoriesBaseVisitorRawConfig extends RawTypesConfig {
  factoryName?: string;
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

export interface FactoriesBaseVisitorParsedConfig extends ParsedTypesConfig {
  enumsAsTypes: boolean;
  factoryName: string;
  scalarDefaults: Record<string, string>;
  namespacedImportName: string | null;
  typesPath?: string;
  importTypesNamespace?: string;
}

export class FactoriesBaseVisitor extends BaseVisitor<
  FactoriesBaseVisitorRawConfig,
  FactoriesBaseVisitorParsedConfig
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

  constructor(schema: GraphQLSchema, config: FactoriesBaseVisitorRawConfig) {
    const parsedConfig = {
      enumsAsTypes: getConfigValue(config.enumsAsTypes, false),
      factoryName: getConfigValue(config.factoryName, "create{Type}Mock"),
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
    } as FactoriesBaseVisitorParsedConfig;

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

  protected convertFactoryName(
    ...args: Parameters<BaseVisitor["convertName"]>
  ): string {
    return this.config.factoryName.replace("{Type}", this.convertName(...args));
  }

  protected convertNameWithNamespace(
    name: string,
    namespace: string | undefined
  ) {
    const convertedName = this.convertName(name);
    return namespace ? `${namespace}.${convertedName}` : convertedName;
  }
}
