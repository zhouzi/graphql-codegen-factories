import * as Types from '../generated/types';

export type UpdateUserOperationMutationVariables = Types.Exact<{
  id: Types.Scalars['ID'];
  name: Types.Scalars['String'];
  role: Types.UserRole;
}>;


export type UpdateUserOperationMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, name: string } };

export function createUserMock(props: Partial<Types.User>): Types.User {
  return {
    __typename: "User",
    id: "",
    name: "",
    role: Types.UserRole.Admin,
    ...props,
  };
}
