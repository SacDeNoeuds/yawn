import './polyfills';

import { State } from "@sacdenoeuds/yawn";
import { Counter } from "./Counter";
import { List } from "./List";
import { TextStreamDemo } from './TextStreamDemo';

const count = new State(0);

function App() {
  return (
    <div>
      <Counter count={count} />
      <List numberOfItems={count} />
      <TextStreamDemo />
    </div>
  );
}
const element = document.getElementById("app");
if (!element) throw new Error("no root element");
element.replaceChildren(<App />);
