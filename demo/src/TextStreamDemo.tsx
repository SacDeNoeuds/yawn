import { State } from "@sacdenoeuds/yawn";
import { TextStream } from "./TextStream";

export function TextStreamDemo() {
    const isRendered = new State(true);
    function reRender() {
        isRendered.set(false);
        setTimeout(() => isRendered.set(true), 100);
    }

    return (
        <div>
            <h1>Text Stream Demo</h1>
            <button type="button" onclick={reRender}>
                Retry
            </button>
            {isRendered.map((isRendered) => {
                if (isRendered) return <TextStream />;
                else return null
            })}
        </div>
    )
}
