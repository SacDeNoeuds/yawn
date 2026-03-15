import { createElement, type ElementProps } from "../create-element";
import type { Children } from "../create-node";
import type { HTMLElements } from "./jsx";

export type { Children };

export type Component<
  Props extends Record<string, any> = Record<string, never>
> = (props: Props & { children?: Children }) => Node;

export type ComponentProps<T> = T extends Component<infer P>
  ? P
  : T extends keyof HTMLElements
  ? ElementProps<T>
  : never;

export const jsx = <TagOrComponent extends keyof HTMLElements | Component<any>>(
  tag: TagOrComponent,
  props: ComponentProps<TagOrComponent> & { children?: Children }
): Node => {
  if (typeof tag === "function") return tag(props);
  const { children, ...attributes } = props;
  return createElement(tag)(attributes)([children]);
};

export { jsx as jsxs };

export { Fragment } from "./fragment";

export type Elements = {
  [Tag in keyof HTMLElements]: ElementProps<Tag> & JSX.IntrinsicAttributes;
};

declare global {
  namespace JSX {
    type Element = Node;
    interface IntrinsicAttributes {}
    interface IntrinsicElements extends Elements {}
  }
}
