export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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

export type Companion = Dog | Droid;

export type Dog = {
  __typename?: 'Dog';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Droid = Humanoid & {
  __typename?: 'Droid';
  codeName: Scalars['String'];
  id: Scalars['ID'];
};

export type Humanoid = {
  id: Scalars['ID'];
};

export type HumanoidConnection = {
  __typename?: 'HumanoidConnection';
  edges: Array<Maybe<HumanoidNode>>;
};

export type HumanoidNode = {
  __typename?: 'HumanoidNode';
  node: Humanoid;
};

export type Query = {
  __typename?: 'Query';
  searchHumanoids?: Maybe<HumanoidConnection>;
  users: Array<User>;
};

export type User = Humanoid & {
  __typename?: 'User';
  companion: Companion;
  id: Scalars['ID'];
  role: UserRole;
};

export enum UserRole {
  Admin = 'ADMIN',
  SuperAdmin = 'SUPER_ADMIN'
}
