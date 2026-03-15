import { absurd, isAsyncIterable, isInstanceOf } from "./utils";
import { onConnected } from "./lifecycle";

const raw = Symbol("RawHTML");
type RawHtml = {
  [raw]: string;
};

export type Children = StaticChildren | ReactiveChildren;
type StaticChildren = Child | Child[];
type ReactiveChildren = AsyncIterable<StaticChildren>;
type Child = string | number | boolean | null | undefined | Node | RawHtml;

export const rawHtml = (html: string): RawHtml => ({ [raw]: html });

/**
 * Here is the distingo between Children and ChildList:
 * renderChildren(textChild, childList) // children = ...[textChild, childList]
 */

export const renderChildren = (
  element: Element | DocumentFragment,
  ...children: Children[]
) => {
  children.flat(5).forEach((child) => {
    isAsyncIterable(child)
      ? renderAsyncIterableChild(element, child)
      : renderChild(element, child);
  });
};

const renderChild = (element: Element | DocumentFragment, child: Child) => {
  const nodes = childToNodes(child);
  nodes.forEach((node) => {
    if (!element.contains(node)) element.append(node);
  });
};

const renderAsyncIterableChild = (
  element: Element | DocumentFragment,
  child: ReactiveChildren
) => {
  let previousNodes: Node[] = [];
  // let previousNode: Node;
  async function render() {
    for await (const childOrList of child) {
      if (!element.isConnected) break; // stop subscription to state
      const asList = Array.isArray(childOrList) ? childOrList : [childOrList];
      const nodes = asList.flat(2).flatMap(childToNodes);
      const anchor = previousNodes[0];

      if (!anchor || anchor.parentElement !== element) element.append(...nodes);
      else {
        // the anchor is usually part of the list.
        const anchorCopy = document.createTextNode("");
        element.insertBefore(anchorCopy, anchor);
        previousNodes.forEach((node) => element.removeChild(node));
        nodes.forEach((node) => element.insertBefore(node, anchorCopy));
        element.removeChild(anchorCopy);
      }
      previousNodes = nodes;
    }
  }
  onConnected(element, render);
};

// const renderChildList = (
//   element: Element | DocumentFragment,
//   list: Child[] | SignalChild[],
// ) => {
//   // TODO: Replace elements one by one instead of whole list.
//   // const previous = previousList.get(element) ?? [];
//   element.replaceChildren()
//   list.forEach((child) => {
//     renderChildren(element, child)
//   })
// }

const isNode = isInstanceOf(Node);
export const childToNodes = (child: Child): Node[] => {
  if (isNode(child)) return [child];
  if (child === undefined || child === null)
    return [document.createTextNode("")];
  if (typeof child === "boolean") return [document.createTextNode("")];
  if (typeof child === "number")
    return [document.createTextNode(String(child))];
  if (typeof child === "string") return [document.createTextNode(child)];
  if (typeof child === "object" && raw in child) {
    const node = document.createElement("div");
    node.outerHTML = child[raw];
    return [node];
  }
  absurd(child);
};
