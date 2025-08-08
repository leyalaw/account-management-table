// типы
import type { DirectiveBinding } from "vue";
// основное
import { Tooltip } from "bootstrap";

/* -------------------------------------------------------------------------- */
/*                                  Подсказка                                 */
/* -------------------------------------------------------------------------- */

interface TooltipBinding extends DirectiveBinding {
  value: string;
  modifiers: {
    constant?: boolean;
  };
}

/* -------------------------------------------------------------------------- */

export default {
  mounted(element: HTMLElement, { value, modifiers }: TooltipBinding) {
    initTooltip(element, value, !!modifiers.constant);
  },

  updated(element: HTMLElement, { value, modifiers }: TooltipBinding) {
    const instance = Tooltip.getInstance(element);

    if (instance) {
      if (!value && !modifiers.constant) instance.dispose();
      else instance.setContent({ ".tooltip-inner": value });
      return;
    }

    initTooltip(element, value, !!modifiers.constant);
  },

  beforeUnmount(element: HTMLElement) {
    const instance = Tooltip.getInstance(element);
    instance?.dispose();
  },
};

function initTooltip(element: HTMLElement, text: string, isConstant: boolean) {
  if (!isConstant && !text) return;

  element.setAttribute("data-bs-toggle", "tooltip");
  element.setAttribute("data-bs-trigger", "hover focus");
  element.setAttribute("data-bs-title", text);

  new Tooltip(element);
}
