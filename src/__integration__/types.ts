export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export enum UserRole {
  SuperAdmin = 'SUPER_ADMIN',
  Admin = 'ADMIN'
}

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  role: UserRole;
};

export type Query = {
  __typename?: 'Query';
  users: Array<User>;
};

export function createUserMock(props: Partial<User>): User {
  return {
    __typename: "User",
    id: "",
    role: UserRole.SuperAdmin,
    ...props,
  };
}
