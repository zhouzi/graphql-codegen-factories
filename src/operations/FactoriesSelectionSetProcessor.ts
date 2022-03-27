import {
  BaseSelectionSetProcessor,
  LinkField,
  PrimitiveAliasedFields,
  PrimitiveField,
  ProcessResult,
  SelectionSetProcessorConfig,
} from "@graphql-codegen/visitor-plugin-common";
import {
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
} from "graphql";

interface FactoriesSelectionSetProcessorRawConfig
  extends Pick<
    SelectionSetProcessorConfig,
    "namespacedImportName" | "convertName" | "enumPrefix" | "scalars"
  > {
  getDefaultValue: (nodeName: string) => string;
}

interface FactoriesSelectionSetProcessorConfig
  extends FactoriesSelectionSetProcessorRawConfig,
    SelectionSetProcessorConfig {}

export class FactoriesSelectionSetProcessor extends BaseSelectionSetProcessor<FactoriesSelectionSetProcessorConfig> {
  constructor(config: FactoriesSelectionSetProcessorRawConfig) {
    super({
      ...config,
      formatNamedField(name) {
        return name;
      },
      wrapTypeWithModifiers: (baseType, type) => {
        if (type instanceof GraphQLNonNull) {
          if (type.ofType instanceof GraphQLList) {
            return "[]";
          }

          return `{\n${baseType}\n},\n`;
        }
        return "null";
      },
    });
  }

  private getDefaultValue(type: GraphQLOutputType): string {
    if (type instanceof GraphQLNonNull) {
      if (type.ofType instanceof GraphQLNonNull) {
        return this.getDefaultValue(type.ofType);
      }

      if (type.ofType instanceof GraphQLList) {
        return "[]";
      }

      return this.config.getDefaultValue(type.ofType.name);
    }

    return "null";
  }

  transformTypenameField(type: string): ProcessResult {
    return [`__typename: ${type},\n`];
  }

  transformPrimitiveFields(
    schemaType: GraphQLInterfaceType | GraphQLObjectType<any, any>,
    queriedFields: PrimitiveField[]
  ): ProcessResult {
    const schemaTypeFields = schemaType.getFields();
    return queriedFields.map(
      ({ fieldName }) =>
        `${fieldName}: ${this.getDefaultValue(
          schemaTypeFields[fieldName].type
        )},\n`
    );
  }

  transformAliasesPrimitiveFields(
    schemaType: GraphQLObjectType | GraphQLInterfaceType,
    queriedFields: PrimitiveAliasedFields[]
  ): ProcessResult {
    const schemaTypeFields = schemaType.getFields();
    return queriedFields.map(
      ({ alias, fieldName }) =>
        `${alias}: ${this.getDefaultValue(schemaTypeFields[fieldName].type)},\n`
    );
  }

  transformLinkFields(fields: LinkField[]): ProcessResult {
    if (fields.length === 0) {
      return [];
    }
    return [
      `${fields
        .map((field) => `${field.alias ?? field.name}: ${field.selectionSet}`)
        .join("")}`,
    ];
  }

  buildSelectionSetFromStrings(pieces: string[]): string {
    return pieces.join("");
  }
}
