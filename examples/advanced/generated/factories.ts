import * as SharedTypes from './types';

export function createDogMock(props: Partial<SharedTypes.Dog>): SharedTypes.Dog {
  return {
    __typename: "Dog",
    id: "",
    name: "",
    ...props,
  };
}

export function createDroidMock(props: Partial<SharedTypes.Droid>): SharedTypes.Droid {
  return {
    __typename: "Droid",
    codeName: "",
    id: "",
    ...props,
  };
}

export function createHumanoidConnectionMock(props: Partial<SharedTypes.HumanoidConnection>): SharedTypes.HumanoidConnection {
  return {
    __typename: "HumanoidConnection",
    edges: [],
    ...props,
  };
}

export function createHumanoidNodeMock(props: Partial<SharedTypes.HumanoidNode>): SharedTypes.HumanoidNode {
  return {
    __typename: "HumanoidNode",
    node: createDroidMock({}),
    ...props,
  };
}

export function createUserMock(props: Partial<SharedTypes.User>): SharedTypes.User {
  return {
    __typename: "User",
    companion: createDogMock({}),
    id: "",
    role: SharedTypes.UserRole.Admin,
    ...props,
  };
}
