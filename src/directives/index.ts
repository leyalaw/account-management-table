// типы
import type { App } from "vue";
// основное
import tooltipDirective from "./tooltip";

/* -------------------------------------------------------------------------- */
/*                                  Директивы                                 */
/* -------------------------------------------------------------------------- */

const directives = { tooltip: tooltipDirective };

const setDirectives = (app: App) => {
  for (const [name, directive] of Object.entries(directives)) {
    app.directive(name, directive);
  }
};

export default setDirectives;
