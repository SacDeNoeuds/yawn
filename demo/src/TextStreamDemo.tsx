import { State } from "@sacdenoeuds/yawn"
import { TextStream } from "./TextStream"

export function TextStreamDemo() {
  const isRendered = new State(true)
  function reRender() {
    isRendered.set(false)
    setTimeout(() => isRendered.set(true), 100)
  }

  return (
    <div style="display: flex; flex-direction: column; gap: 0.5rem">
      <div>
        <button type="button" onclick={reRender}>
          Retry
        </button>
      </div>
      <div>
        {isRendered.map((isRendered) => {
          return isRendered ? <TextStream /> : null
        })}
      </div>
    </div>
  )
}
