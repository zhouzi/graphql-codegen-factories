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

export type Author = {
  __typename?: 'Author';
  id: Scalars['Int'];
  firstName: Scalars['String'];
  lastName?: Maybe<Scalars['String']>;
  posts: Array<Maybe<Post>>;
  status: AuthorStatus;
};


export type AuthorPostsArgs = {
  findTitle?: Maybe<Scalars['String']>;
};

export enum AuthorStatus {
  Admin = 'Admin',
  User = 'User'
}

export type Post = {
  __typename?: 'Post';
  id: Scalars['Int'];
  title: Scalars['String'];
  author: Author;
};

export type Query = {
  __typename?: 'Query';
  posts?: Maybe<Array<Maybe<Post>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createPost: Post;
};


export type MutationCreatePostArgs = {
  post: PostInput;
};

export type PostInput = {
  title?: Maybe<Scalars['String']>;
  autor?: Maybe<Author>;
};

export function createAuthor(props: Partial<Author>): Author {
  return {
    __typename: "Author",
    id: 0,
    firstName: "",
    lastName: null,
    posts: [],
    status: AuthorStatus.Admin,
    ...props,
  };
};


export function createPost(props: Partial<Post>): Post {
  return {
    __typename: "Post",
    id: 0,
    title: "",
    author: createAuthor({}),
    ...props,
  };
};



