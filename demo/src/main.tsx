import "./polyfills"

import { State } from "@sacdenoeuds/yawn"
import type { Children } from "@sacdenoeuds/yawn/jsx/jsx-runtime"
import { Clock } from "./Clock"
import { Counter } from "./Counter"
import { List } from "./List"
import { TextStreamDemo } from "./TextStreamDemo"
import { TodoFetcher } from './TodoFetcher'

const count = new State(0)

function App() {
  return (
    <div class='app'>
      <Section heading="Todo fetcher">
        <TodoFetcher />
      </Section>
      <Section heading="Counter">
        <Counter count={count} />
      </Section>
      <Section heading="List">
        <List numberOfItems={count} />
      </Section>
      <Section heading="Text stream demo">
        <TextStreamDemo />
      </Section>
      <Section heading="Clock">
        <Clock />
      </Section>
    </div>
  )
}
const element = document.getElementById("app")
if (!element) throw new Error("no root element")
element.replaceChildren(<App />)

type SectionProps = {
  heading: string
  children: Children
}
function Section({ heading, children }: SectionProps) {
  return (
    <section class="app-section">
      <h3>{heading}</h3>
      <div>{children}</div>
    </section>
  )
}
