import {
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  NamedTypeNode,
  NonNullTypeNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
} from "graphql";
import {
  DeclarationBlock,
  indent,
} from "@graphql-codegen/visitor-plugin-common";
import { FactoriesBaseVisitor } from "../FactoriesBaseVisitor";

interface VisitedTypeNode {
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

export class FactoriesSchemaVisitor extends FactoriesBaseVisitor {
  protected convertObjectType(
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

  protected convertField(
    node: UnvisitedFieldDefinitionNode | UnvisitedInputValueDefinitionNode
  ): string {
    const { defaultValue, isNullable } = node.type;
    return indent(
      indent(`${node.name.value}: ${isNullable ? "null" : defaultValue},`)
    );
  }

  NamedType(node: NamedTypeNode): VisitedTypeNode {
    return {
      defaultValue: this.getDefaultValue(node.name.value),
      isNullable: true,
    };
  }

  ListType(): VisitedTypeNode {
    return {
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
    if (["Query", "Mutation"].includes(node.name.value)) {
      return undefined;
    }

    return this.convertObjectType(node);
  }
}
