import {
  DeclarationBlock,
  indent,
  LoadedFragment,
  SelectionSetToObject,
} from "@graphql-codegen/visitor-plugin-common";
import { GraphQLSchema, OperationDefinitionNode } from "graphql";
import { pascalCase } from "change-case-all";
import { FactoriesBaseVisitorRawConfig } from "../FactoriesBaseVisitor";
import { FactoriesBaseVisitor } from "../FactoriesBaseVisitor";
import { FactoriesSelectionSetProcessor } from "./FactoriesSelectionSetProcessor";

export class FactoriesOperationsVisitor extends FactoriesBaseVisitor {
  private unnamedCounter = 1;
  private schema: GraphQLSchema;
  private selectionSetToObject: SelectionSetToObject;

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    config: FactoriesBaseVisitorRawConfig
  ) {
    super(schema, config);

    this.schema = schema;

    this.selectionSetToObject = new SelectionSetToObject(
      new FactoriesSelectionSetProcessor({
        namespacedImportName: null,
        convertName: this.convertName.bind(this),
        enumPrefix: null,
        scalars: this.scalars,
        formatNamedField(name) {
          return name;
        },
        wrapTypeWithModifiers(baseType) {
          return baseType;
        },
        getDefaultValue: this.getDefaultValue.bind(this),
      }),
      this.scalars,
      this.schema,
      this.convertName.bind(this),
      this.getFragmentSuffix.bind(this),
      fragments,
      {
        ...this.config,
        preResolveTypes: false,
        globalNamespace: false,
        operationResultSuffix: "",
        dedupeOperationSuffix: false,
        omitOperationSuffix: true,
        exportFragmentSpreadSubTypes: false,
        skipTypeNameForRoot: true,
        experimentalFragmentVariables: false,
      }
    );
  }

  private handleAnonymousOperation(node: OperationDefinitionNode): string {
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

  OperationDefinition(node: OperationDefinitionNode): string {
    const name = this.handleAnonymousOperation(node);

    const ROOT_TYPE_GETTER = {
      query: (schema: GraphQLSchema) => schema.getQueryType(),
      mutation: (schema: GraphQLSchema) => schema.getMutationType(),
      subscription: (schema: GraphQLSchema) => schema.getSubscriptionType(),
    };
    const operationRootType = ROOT_TYPE_GETTER[node.operation](this.schema);

    if (operationRootType == null) {
      throw new Error(
        `Unable to find root schema type for operation type "${node.operation}"!`
      );
    }

    const selectionSet = this.selectionSetToObject.createNext(
      operationRootType,
      node.selectionSet
    );

    const operationType = pascalCase(node.operation);
    const operationTypeSuffix = this.getOperationSuffix(name, operationType);

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind("function")
      .withName(
        `${this.convertFactoryName(node, {
          suffix: operationTypeSuffix,
        })}(props: Partial<${this.convertNameWithNamespace(node, {
          suffix: operationTypeSuffix,
        })}>): ${this.convertNameWithNamespace(node, {
          suffix: operationTypeSuffix,
        })}`
      )
      .withBlock(
        [
          indent("return {"),
          selectionSet.transformSelectionSet(),
          indent(indent("...props,")),
          indent("};"),
        ]
          .filter(Boolean)
          .join("\n")
      ).string;
  }
}
