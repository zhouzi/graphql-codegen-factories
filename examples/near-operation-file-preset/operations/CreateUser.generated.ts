import * as Types from '../generated/types';

export type CreateUserMutationVariables = Types.Exact<{
  name: Types.Scalars['String'];
  role: Types.UserRole;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, name: string, role: Types.UserRole } };

export function createUserMock(props: Partial<Types.User>): Types.User {
  return {
    __typename: "User",
    id: "",
    name: "",
    role: Types.UserRole.Admin,
    ...props,
  };
}
