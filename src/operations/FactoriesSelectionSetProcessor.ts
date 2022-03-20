import {
  BaseSelectionSetProcessor,
  LinkField,
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

interface FactoriesSelectionSetProcessorConfig
  extends SelectionSetProcessorConfig {
  getDefaultValue: (nodeName: string) => string;
}

export class FactoriesSelectionSetProcessor extends BaseSelectionSetProcessor<FactoriesSelectionSetProcessorConfig> {
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

  transformAliasesPrimitiveFields(): ProcessResult {
    return [];
  }

  transformLinkFields(fields: LinkField[]): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    return [
      `${fields
        .map(
          (field) => `${field.alias ?? field.name}: {\n${field.selectionSet}\n}`
        )
        .join(",\n")}`,
    ];
  }

  buildSelectionSetFromStrings(pieces: string[]): string {
    return pieces.join("");
  }
}
