export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  users: Array<User>;
};

export function createUserMock(props: Partial<User>): User {
  return {
    __typename: "User",
    id: "",
    ...props,
  };
}
