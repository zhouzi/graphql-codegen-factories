"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[355],{5318:function(e,t,n){n.d(t,{Zo:function(){return c},kt:function(){return u}});var a=n(7378);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var o=a.createContext({}),p=function(e){var t=a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},c=function(e){var t=p(e.components);return a.createElement(o.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},g=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),g=p(n),u=r,h=g["".concat(o,".").concat(u)]||g[u]||m[u]||i;return n?a.createElement(h,s(s({ref:t},c),{},{components:n})):a.createElement(h,s({ref:t},c))}));function u(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,s=new Array(i);s[0]=g;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l.mdxType="string"==typeof e?e:r,s[1]=l;for(var p=2;p<i;p++)s[p]=n[p];return a.createElement.apply(null,s)}return a.createElement.apply(null,n)}g.displayName="MDXCreateElement"},855:function(e,t,n){n.r(t),n.d(t,{assets:function(){return c},contentTitle:function(){return o},default:function(){return u},frontMatter:function(){return l},metadata:function(){return p},toc:function(){return m}});var a=n(5773),r=n(808),i=(n(7378),n(5318)),s=["components"],l={sidebar_position:1},o="Schema",p={unversionedId:"configuration/schema",id:"configuration/schema",title:"Schema",description:"config.factoryName",source:"@site/docs/configuration/schema.mdx",sourceDirName:"configuration",slug:"/configuration/schema",permalink:"/graphql-codegen-factories/configuration/schema",editUrl:"https://github.com/zhouzi/graphql-codegen-factories/blob/main/docs/docs/configuration/schema.mdx",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"default",previous:{title:"Getting Started",permalink:"/graphql-codegen-factories/getting-started"},next:{title:"Operations",permalink:"/graphql-codegen-factories/configuration/operations"}},c={},m=[{value:"<code>config.factoryName</code>",id:"configfactoryname",level:2},{value:"<code>config.scalarDefaults</code>",id:"configscalardefaults",level:2},{value:"<code>config.typesPath</code>",id:"configtypespath",level:2},{value:"<code>config.importTypesNamespace</code>",id:"configimporttypesnamespace",level:2}],g={toc:m};function u(e){var t=e.components,n=(0,r.Z)(e,s);return(0,i.kt)("wrapper",(0,a.Z)({},g,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"schema"},"Schema"),(0,i.kt)("h2",{id:"configfactoryname"},(0,i.kt)("inlineCode",{parentName:"h2"},"config.factoryName")),(0,i.kt)("p",null,"By default, this plugin generates factories named ",(0,i.kt)("inlineCode",{parentName:"p"},"create{Type}Mock"),".\nSo for a type ",(0,i.kt)("inlineCode",{parentName:"p"},"User"),", the corresponding factory will be named ",(0,i.kt)("inlineCode",{parentName:"p"},"createUserMock"),"."),(0,i.kt)("details",null,(0,i.kt)("summary",null,"Example"),(0,i.kt)("div",{className:"codeBlocks"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-graphql",metastring:'title="schema.graphql"',title:'"schema.graphql"'},"type User {\n  id: ID!\n  username: String!\n}\n")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript",metastring:'title="types.ts"',title:'"types.ts"'},'// highlight-start\nexport function createUserMock(props: Partial<User>): User {\n  // highlight-end\n  return {\n    id: "",\n    username: "",\n    ...props,\n  };\n}\n')))),(0,i.kt)("p",null,"You can customize the factories' name by configuring ",(0,i.kt)("inlineCode",{parentName:"p"},"factoryName"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-yml",metastring:'title="codegen.yml"',title:'"codegen.yml"'},"overwrite: true\nschema: ./schema.graphql\ngenerates:\n  ./types.ts:\n    plugins:\n      - typescript\n      - graphql-codegen-factories/schema\n    config:\n      # highlight-start\n      factoryName: new{Type}\n      # highlight-end\n")),(0,i.kt)("details",null,(0,i.kt)("summary",null,"Example"),(0,i.kt)("div",{className:"codeBlocks"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-graphql",metastring:'title="schema.graphql"',title:'"schema.graphql"'},"type User {\n  id: ID!\n  username: String!\n}\n")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript",metastring:'title="types.ts"',title:'"types.ts"'},'// highlight-start\nexport function newUser(props: Partial<User>): User {\n  // highlight-end\n  return {\n    id: "",\n    username: "",\n    ...props,\n  };\n}\n')))),(0,i.kt)("h2",{id:"configscalardefaults"},(0,i.kt)("inlineCode",{parentName:"h2"},"config.scalarDefaults")),(0,i.kt)("p",null,"By default, this plugin infers the default values based on the properties' type.\nFor example, a property whose type is ",(0,i.kt)("inlineCode",{parentName:"p"},"Boolean")," will have a value of ",(0,i.kt)("inlineCode",{parentName:"p"},"false"),"."),(0,i.kt)("details",null,(0,i.kt)("summary",null,"Example"),(0,i.kt)("div",{className:"codeBlocks"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-graphql",metastring:'title="schema.graphql"',title:'"schema.graphql"'},"type User {\n  isAdmin: Boolean!\n}\n")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript",metastring:'title="types.ts"',title:'"types.ts"'},"export function createUserMock(props: Partial<User>): User {\n  return {\n    // highlight-start\n    isAdmin: false,\n    // highlight-end\n    ...props,\n  };\n}\n")))),(0,i.kt)("p",null,"You can customize the default values by configuring ",(0,i.kt)("inlineCode",{parentName:"p"},"scalarDefaults"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-yml",metastring:'title="codegen.yml"',title:'"codegen.yml"'},"overwrite: true\nschema: ./schema.graphql\ngenerates:\n  ./types.ts:\n    plugins:\n      - typescript\n      - graphql-codegen-factories/schema\n    config:\n      scalarDefaults:\n        # highlight-start\n        Boolean: true\n        # highlight-end\n")),(0,i.kt)("details",null,(0,i.kt)("summary",null,"Example"),(0,i.kt)("div",{className:"codeBlocks"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-graphql",metastring:'title="schema.graphql"',title:'"schema.graphql"'},"type User {\n  isAdmin: Boolean!\n}\n")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript",metastring:'title="types.ts"',title:'"types.ts"'},"export function createUserMock(props: Partial<User>): User {\n  return {\n    // highlight-start\n    isAdmin: true,\n    // highlight-end\n    ...props,\n  };\n}\n")))),(0,i.kt)("div",{className:"admonition admonition-caution alert alert--warning"},(0,i.kt)("div",{parentName:"div",className:"admonition-heading"},(0,i.kt)("h5",{parentName:"div"},(0,i.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,i.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"},(0,i.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"}))),"caution")),(0,i.kt)("div",{parentName:"div",className:"admonition-content"},(0,i.kt)("p",{parentName:"div"},"This plugin only infers default values for built-in scalars.\nYou will probably need to use this option to define the values of custom scalars, e.g ",(0,i.kt)("inlineCode",{parentName:"p"},"Date"),"."),(0,i.kt)("details",null,(0,i.kt)("summary",null,"Example"),(0,i.kt)("pre",{parentName:"div"},(0,i.kt)("code",{parentName:"pre",className:"language-yml",metastring:'title="codegen.yml"',title:'"codegen.yml"'},"overwrite: true\nschema: ./schema.graphql\ngenerates:\n  ./types.ts:\n    plugins:\n      - typescript\n      - graphql-codegen-factories/schema\n    config:\n      scalarDefaults:\n        # highlight-start\n        Date: new Date()\n        # highlight-end\n")),(0,i.kt)("div",{className:"codeBlocks"},(0,i.kt)("pre",{parentName:"div"},(0,i.kt)("code",{parentName:"pre",className:"language-graphql",metastring:'title="schema.graphql"',title:'"schema.graphql"'},"scalar Date\n\ntype User {\n  createdAt: Date!\n}\n")),(0,i.kt)("pre",{parentName:"div"},(0,i.kt)("code",{parentName:"pre",className:"language-typescript",metastring:'title="types.ts"',title:'"types.ts"'},"export function createUserMock(props: Partial<User>): User {\n  return {\n    // highlight-start\n    createdAt: new Date(),\n    // highlight-end\n    ...props,\n  };\n}\n")))))),(0,i.kt)("h2",{id:"configtypespath"},(0,i.kt)("inlineCode",{parentName:"h2"},"config.typesPath")),(0,i.kt)("p",null,"By default, this plugin assumes that the types and factories are generated in the same file.\nThe factories reference types without importing them."),(0,i.kt)("p",null,"If you want to generate types and factories in different files, you need to provide the ",(0,i.kt)("inlineCode",{parentName:"p"},"typesPath"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-yml",metastring:'title="codegen.yml"',title:'"codegen.yml"'},"overwrite: true\nschema: ./schema.graphql\ngenerates:\n  ./types.ts:\n    plugins:\n      - typescript\n  ./factories.ts:\n    plugins:\n      - graphql-codegen-factories/schema\n    config:\n      # highlight-start\n      typesPath: ./types\n      # highlight-end\n")),(0,i.kt)("details",null,(0,i.kt)("summary",null,"Example"),(0,i.kt)("div",{className:"codeBlocks"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-graphql",metastring:'title="schema.graphql"',title:'"schema.graphql"'},"type User {\n  id: ID!\n  username: String!\n}\n")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript",metastring:'title="factories.ts"',title:'"factories.ts"'},'// highlight-start\nimport * as Types from "./types";\n// highlight-end\n\nexport function createUserMock(props: Partial<Types.User>): Types.User {\n  return {\n    id: "",\n    username: "",\n    ...props,\n  };\n}\n')))),(0,i.kt)("div",{className:"admonition admonition-info alert alert--info"},(0,i.kt)("div",{parentName:"div",className:"admonition-heading"},(0,i.kt)("h5",{parentName:"div"},(0,i.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,i.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,i.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"}))),"info")),(0,i.kt)("div",{parentName:"div",className:"admonition-content"},(0,i.kt)("p",{parentName:"div"},"You don't need to configure this option when using ",(0,i.kt)("a",{parentName:"p",href:"https://www.graphql-code-generator.com/plugins/near-operation-file-preset"},"@graphql-codegen/near-operation-file-preset"),"."))),(0,i.kt)("h2",{id:"configimporttypesnamespace"},(0,i.kt)("inlineCode",{parentName:"h2"},"config.importTypesNamespace")),(0,i.kt)("p",null,"By default, the import types namespace when using ",(0,i.kt)("inlineCode",{parentName:"p"},"config.typesPath")," is ",(0,i.kt)("inlineCode",{parentName:"p"},"Types"),"."),(0,i.kt)("p",null,"You can customize this namespace by configuring ",(0,i.kt)("inlineCode",{parentName:"p"},"importTypesNamespace"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-yml"},"overwrite: true\nschema: ./schema.graphql\ngenerates:\n  ./types.ts:\n    plugins:\n      - typescript\n  ./factories.ts:\n    plugins:\n      - graphql-codegen-factories/schema\n    config:\n      typesPath: ./types\n      # highlight-start\n      importTypesNamespace: SharedTypes\n      # highlight-end\n")),(0,i.kt)("details",null,(0,i.kt)("summary",null,"Example"),(0,i.kt)("div",{className:"codeBlocks"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-graphql",metastring:'title="schema.graphql"',title:'"schema.graphql"'},"type User {\n  id: ID!\n  username: String!\n}\n")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript",metastring:'title="factories.ts"',title:'"factories.ts"'},'// highlight-start\nimport * as SharedTypes from "./types";\n// highlight-end\n\nexport function createUserMock(\n  props: Partial<SharedTypes.User>\n): SharedTypes.User {\n  return {\n    id: "",\n    username: "",\n    ...props,\n  };\n}\n')))))}u.isMDXComponent=!0}}]);