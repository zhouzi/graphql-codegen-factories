import {
  BaseVisitor,
  ParsedTypesConfig,
  RawTypesConfig,
} from "@graphql-codegen/visitor-plugin-common";

export interface FactoriesBaseVisitorRawConfig extends RawTypesConfig {
  factoryName?: string;
}

export interface FactoriesBaseVisitorParsedConfig extends ParsedTypesConfig {
  factoryName: string;
}

export class FactoriesBaseVisitor<
  RawConfig extends FactoriesBaseVisitorRawConfig,
  ParsedConfig extends FactoriesBaseVisitorParsedConfig
> extends BaseVisitor<RawConfig, ParsedConfig> {
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
