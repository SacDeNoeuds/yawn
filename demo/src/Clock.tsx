
async function* makeClock(intervalInMs: number) {
  while (true) {
    yield new Date()
    await delay(intervalInMs)
  }
}


export function Clock() {
  const time = makeClock(1_000);
    return (
      <div style="font-variant: tabular-nums">
        Time: {time.map(timeFormatter.format)}
      </div>
  )
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const timeFormatter = new Intl.DateTimeFormat(undefined, {
    timeStyle: 'medium',
})
