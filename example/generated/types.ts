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

export function createDogMock(props: Partial<Dog>): Dog {
  return {
    __typename: "Dog",
    id: "",
    name: "",
    ...props,
  };
}

export function createDroidMock(props: Partial<Droid>): Droid {
  return {
    __typename: "Droid",
    codeName: "",
    id: "",
    ...props,
  };
}

export function createHumanoidConnectionMock(props: Partial<HumanoidConnection>): HumanoidConnection {
  return {
    __typename: "HumanoidConnection",
    edges: [],
    ...props,
  };
}

export function createHumanoidNodeMock(props: Partial<HumanoidNode>): HumanoidNode {
  return {
    __typename: "HumanoidNode",
    node: createDroidMock({}),
    ...props,
  };
}

export function createUserMock(props: Partial<User>): User {
  return {
    __typename: "User",
    companion: createDogMock({}),
    id: "",
    role: UserRole.Admin,
    ...props,
  };
}
