"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[714],{5318:function(e,t,r){r.d(t,{Zo:function(){return l},kt:function(){return f}});var n=r(7378);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var s=n.createContext({}),p=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},l=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),m=p(r),f=a,d=m["".concat(s,".").concat(f)]||m[f]||u[f]||o;return r?n.createElement(d,i(i({ref:t},l),{},{components:r})):n.createElement(d,i({ref:t},l))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=m;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c.mdxType="string"==typeof e?e:a,i[1]=c;for(var p=2;p<o;p++)i[p]=r[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},5970:function(e,t,r){r.r(t),r.d(t,{assets:function(){return l},contentTitle:function(){return s},default:function(){return f},frontMatter:function(){return c},metadata:function(){return p},toc:function(){return u}});var n=r(5773),a=r(808),o=(r(7378),r(5318)),i=["components"],c={sidebar_position:1},s="Introduction",p={unversionedId:"readme",id:"readme",title:"Introduction",description:"graphql-codegen-factories is a plugin for GraphQL Code Generator that generates factories based on a GraphQL schema and operations.",source:"@site/docs/readme.mdx",sourceDirName:".",slug:"/",permalink:"/graphql-codegen-factories/",editUrl:"https://github.com/zhouzi/graphql-codegen-factories/blob/main/docs/docs/readme.mdx",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"default",next:{title:"Getting Started",permalink:"/graphql-codegen-factories/getting-started"}},l={},u=[{value:"Examples",id:"examples",level:2}],m={toc:u};function f(e){var t=e.components,r=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,n.Z)({},m,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"introduction"},"Introduction"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"graphql-codegen-factories")," is a plugin for ",(0,o.kt)("a",{parentName:"p",href:"https://www.graphql-code-generator.com/"},"GraphQL Code Generator")," that generates factories based on a GraphQL schema and operations.\nThose factories can then be used to create objects that match the schema, for example to mock data in tests or to seed a database."),(0,o.kt)("div",{className:"codeBlocks"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-graphql",metastring:'title="schema.graphql"',title:'"schema.graphql"'},"type User {\n  id: ID!\n  username: String!\n}\n\ntype Query {\n  loggedInUser: User!\n}\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript",metastring:'title="factories.ts"',title:'"factories.ts"'},'export function createUserMock(props: Partial<User>): User {\n  return {\n    id: "",\n    username: "",\n    ...props,\n  };\n}\n'))),(0,o.kt)("p",null,"You can ",(0,o.kt)("a",{parentName:"p",href:"https://stackblitz.com/github/zhouzi/graphql-codegen-factories/tree/main/examples/basic"},"play around with a demo in your browser"),"."),(0,o.kt)("h2",{id:"examples"},"Examples"),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Real world")),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://github.com/yummy-recipes/yummy"},"yummy-recipes/yummy"))),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Demos")),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://stackblitz.com/github/zhouzi/graphql-codegen-factories/tree/main/examples/basic"},"Basic")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://stackblitz.com/github/zhouzi/graphql-codegen-factories/tree/main/examples/usage-with-near-operation-file-preset"},"Usage with near-operation-file-preset")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://stackblitz.com/github/zhouzi/graphql-codegen-factories/tree/main/examples/usage-with-faker"},"Usage with faker"))),(0,o.kt)("p",null,"Are you using this plugin? ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/zhouzi/graphql-codegen-factories/issues/new?title=Add%20my%20project%20to%20the%20examples"},"Let us know!")))}f.isMDXComponent=!0}}]);