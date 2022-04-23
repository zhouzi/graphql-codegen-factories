import { indent } from "@graphql-codegen/visitor-plugin-common";

type Line = string | string[];
type Lines = Array<Line | Lines>;

export function print(lines: Lines, count = 0): string {
  return lines
    .map((line) => {
      if (Array.isArray(line)) {
        return print(line, count + 1);
      }
      return indent(line, count);
    })
    .join("\n");
}
