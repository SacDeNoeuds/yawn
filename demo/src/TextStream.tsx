export function TextStream() {
    const stream = makeFakeReadableStream("Hello, this is a text stream demo using Yawn. Enjoy watching the text appear character by character!");
    const textStream = streamToText(stream);
    const text = reduce(textStream, '', (acc, text) => acc + text);

    return <p>{text}</p>
}

async function *reduce<T, U>(iterable: AsyncIterable<U>, initialValue: T, reducer: (acc: T, current: U) => T) {
    let acc = initialValue;
    for await (const item of iterable) {
        acc = reducer(acc, item);
        yield acc;
    }
}

async function* streamToText(iterable: AsyncIterable<Uint8Array>) {
    const decoder = new TextDecoder();
    for await (const chunk of iterable) {
        yield decoder.decode(chunk, { stream: true });
    }
}

function makeFakeReadableStream(text: string): ReadableStream<Uint8Array> {
    let index = 0;
    const latencyInMs = 1_000; // ms

    return new ReadableStream<Uint8Array>({
        start(controller) {
            const encoder = new TextEncoder();

            const pushChunk = () => {
                if (index >= text.length) {
                    controller.close();
                    return;
                }

                const size = Math.min(10, text.length - index);
                const chunkText = text.slice(index, index + size);
                index += size;

                controller.enqueue(encoder.encode(chunkText));

                setTimeout(pushChunk, latencyInMs); // simulate network delay
            };

            pushChunk();
        },
    });
}