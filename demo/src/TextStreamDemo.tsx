import { State } from "@sacdenoeuds/yawn"
import { TextStream } from "./TextStream"

export function TextStreamDemo() {
  const isRendered = new State(true)

  function reRender() {
    isRendered.set(false)
    setTimeout(() => isRendered.set(true), 100)
  }

  return (
    <div class="vertical-spacer gap-s">
      <div>
        <button type="button" onclick={reRender}>
          Retry
        </button>
      </div>
      <div>
        {console.debug('template', { isRendered })}
        {map(isRendered, (isRendered) => {
          console.debug({ isRendered })
          return isRendered ? <TextStream /> : null
        })}
      </div>
    </div>
  )
}

async function* map<T, U>(iterable: AsyncIterable<T>, mapper: (value: T) => U) {
  for await (const value of iterable) {
    yield mapper(value)
  }
}
