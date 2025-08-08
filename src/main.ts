import { createApp } from "vue";
import { createPinia } from "pinia";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./style.css";
import setDirectives from "./directives";
import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();

setDirectives(app);

app.use(pinia).mount("#app");
