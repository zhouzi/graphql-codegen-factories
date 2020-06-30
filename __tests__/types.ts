export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
};


/** Post's author */
export type Author = {
  __typename?: 'Author';
  id: Scalars['Int'];
  firstName: Scalars['String'];
  lastName?: Maybe<Scalars['String']>;
  posts: Array<Maybe<Post>>;
  status: AuthorStatus;
  createdAt: Scalars['Date'];
  isAdmin: Scalars['Boolean'];
};


/** Post's author */
export type AuthorPostsArgs = {
  findTitle?: Maybe<Scalars['String']>;
};

/** Author's status */
export enum AuthorStatus {
  Admin = 'ADMIN',
  User = 'USER'
}

/** Post */
export type Post = {
  __typename?: 'Post';
  id: Scalars['Int'];
  title: Scalars['String'];
  author: Author;
  comments: Array<Comments>;
};

export type Comments = {
  __typename?: 'comments';
  id: Scalars['ID'];
  message?: Maybe<Scalars['String']>;
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

export function newAuthor(props: Partial<Author>): Author {
  return {
    __typename: "Author",
    id: 0,
    firstName: "",
    lastName: null,
    posts: [],
    status: AuthorStatus.Admin,
    createdAt: new Date(),
    isAdmin: true,
    ...props,
  };
};

export function newPost(props: Partial<Post>): Post {
  return {
    __typename: "Post",
    id: 0,
    title: "",
    author: newAuthor({}),
    comments: [],
    ...props,
  };
};

export function newComments(props: Partial<Comments>): Comments {
  return {
    __typename: "comments",
    id: "",
    message: null,
    author: newAuthor({}),
    ...props,
  };
};

export function newPostInput(props: Partial<PostInput>): PostInput {
  return {
    title: null,
    autor: null,
    ...props,
  };
};
