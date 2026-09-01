/**
 * Lets a reused code file have any extension, including .json.
 *
 * `CodeSnippet` reads its file with `!!raw-loader!`, which hands back a
 * JavaScript module: `export default "…"`. The `!!` prefix disables the
 * loaders a rule would add, but it does not change the module *type* the
 * bundler infers from the extension — so a `.json` file is handed to the JSON
 * parser, which meets the word `export` and fails the build:
 *
 *   × JSON parse error: Unexpected character e
 *
 * Showing a JSON config is an obvious thing to want, so the type is stated
 * explicitly for anything under `reuse/code/`. `javascript/auto` is what
 * raw-loader's output actually is.
 */
module.exports = function reuseCodeLoader() {
  return {
    name: "docstatic-reuse-code",
    configureWebpack() {
      return {
        module: {
          rules: [
            {
              test: /[\\/]reuse[\\/]code[\\/].*\.json$/,
              type: "javascript/auto",
            },
          ],
        },
      };
    },
  };
};
