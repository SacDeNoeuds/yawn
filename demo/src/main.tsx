import "./polyfills"

import { State } from "@sacdenoeuds/yawn"
import type { Children } from "@sacdenoeuds/yawn/jsx/jsx-runtime"
import { Clock } from "./Clock"
import { Counter } from "./Counter"
import { List } from "./List"
import { TextStreamDemo } from "./TextStreamDemo"
import { TodoFetcher } from "./TodoFetcher"

const count = new State(0)

function App() {
  return (
    <div class="app">
      <Section
        heading="Todo fetcher"
        linkToSourceCode="https://github.com/SacDeNoeuds/yawn/blob/main/demo/src/TodoFetcher.tsx"
      >
        <TodoFetcher />
      </Section>

      <Section
        heading="Counter"
        linkToSourceCode="https://github.com/SacDeNoeuds/yawn/blob/main/demo/src/Counter.tsx"
      >
        <Counter count={count} />
      </Section>

      <Section
        heading="List"
        linkToSourceCode="https://github.com/SacDeNoeuds/yawn/blob/main/demo/src/List.tsx"
      >
        <List numberOfItems={count} />
      </Section>

      <Section
        heading="Text stream demo"
        linkToSourceCode="https://github.com/SacDeNoeuds/yawn/blob/main/demo/src/TextStream.tsx"
      >
        <TextStreamDemo />
      </Section>

      <Section
        heading="Clock"
        linkToSourceCode="https://github.com/SacDeNoeuds/yawn/blob/main/demo/src/Clock.tsx"
      >
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
  linkToSourceCode: string
}
function Section({ heading, linkToSourceCode, children }: SectionProps) {
  return (
    <section class="app-section">
      <header>
        <h3>{heading}</h3>
        <a href={linkToSourceCode} target="_blank" rel="noopener noreferer">
          Source code
        </a>
      </header>

      <div>{children}</div>
    </section>
  )
}
