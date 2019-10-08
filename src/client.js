/*

Q: What are we doing here?
A: This goes into the webpack bundle. When it loads in the browser
it will automatically load the state given by the server.

More info:
https://markojs.com/docs/server-side-rendering/#bootstrapping-non-lasso

*/

require("./components/isomorphic-marko-app/index.marko");
require("marko/components").init();
