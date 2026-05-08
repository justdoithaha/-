import { bindEvents, bindKeyboard } from "./actions.js";
import { $ } from "./utils.js";
import { appView } from "./views.js";

function render() {
  $("#app").innerHTML = appView();
  bindEvents(render);
}

bindKeyboard(render);
render();
