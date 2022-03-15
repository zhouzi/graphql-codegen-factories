import {
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  NamedTypeNode,
  NonNullTypeNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
} from "graphql";
import { FactoriesBaseVisitor } from "../FactoriesBaseVisitor";

interface TypeValue {
  defaultValue: string;
  isNullable: boolean;
}

export class FactoriesSchemaVisitor extends FactoriesBaseVisitor {
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

  DirectiveDefinition(): string {
    return "";
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    if (["Query", "Mutation"].includes(node.name.value)) {
      return "";
    }

    return this.convertObjectType(node);
  }
}
