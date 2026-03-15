import { renderChildren } from "../create-node";
import type { Children } from "./jsx-runtime";
import { onConnected } from "../lifecycle";

export const Fragment = (props: { children?: Children }): Node => {
  const mount = (element: HTMLElement) => {
    onConnected(element, () => {
      const parent = element.parentElement;
      if (!parent) return;
      parent.removeChild(element);
      renderChildren(parent, props.children);
    });
  };
  return <span ref={mount} />;
};
