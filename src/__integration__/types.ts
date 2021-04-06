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
  companion: Companion;
};

export type Droid = {
  __typename?: 'Droid';
  id: Scalars['ID'];
  codeName: Scalars['String'];
};

export type Dog = {
  __typename?: 'Dog';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Companion = Droid | Dog;

export type Query = {
  __typename?: 'Query';
  users: Array<User>;
};

export function createUserMock(props: Partial<User>): User {
  return {
    __typename: "User",
    id: "",
    role: UserRole.SuperAdmin,
    companion: createDroidMock({}),
    ...props,
  };
}

export function createDroidMock(props: Partial<Droid>): Droid {
  return {
    __typename: "Droid",
    id: "",
    codeName: "",
    ...props,
  };
}

export function createDogMock(props: Partial<Dog>): Dog {
  return {
    __typename: "Dog",
    id: "",
    name: "",
    ...props,
  };
}
