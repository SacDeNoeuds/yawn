const Notifier = (predicate: (node: Node) => unknown) => {
  const map = new Map<Node, Set<() => void>>();
  const listen = (node: Node, listener: () => void) => {
    const set = map.get(node) ?? new Set();
    set.add(listener);
    map.set(node, set);
  };
  let prevPredicated: boolean | undefined = undefined;
  const notify = () => {
    map.forEach((listeners, node) => {
      const predicated = Boolean(predicate(node));
      if (prevPredicated === predicated || !(prevPredicated = predicated))
        return;
      listeners.forEach((listener) => listener());
      // map.delete(node);
    });
  };
  return [listen, notify] as const;
};

const [onConnected, notifyConnected] = Notifier((node) => node.isConnected);
const [onDisconnected, notifyDisconnected] = Notifier(
  (node) => !node.isConnected
);

export { onConnected, onDisconnected };

const observer = new MutationObserver(() => {
  notifyConnected();
  notifyDisconnected();
});

observer.observe(document.body, { childList: true, subtree: true });
