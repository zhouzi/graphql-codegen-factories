import {
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  NamedTypeNode,
  NonNullTypeNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
} from "graphql";
import { FactoriesBaseVisitor, TypeValue } from "../FactoriesBaseVisitor";

export class FactoriesSchemaVisitor extends FactoriesBaseVisitor {
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
      ...(node.type as unknown as TypeValue),
      isNullable: false,
    };
  }

  FieldDefinition(node: FieldDefinitionNode): string {
    return this.convertField(node);
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    return this.convertObjectType(node);
  }

  InputValueDefinition(node: InputValueDefinitionNode): string {
    return this.convertField(node);
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string | undefined {
    if (["Query", "Mutation"].includes(node.name.value)) {
      return undefined;
    }

    return this.convertObjectType(node);
  }
}
