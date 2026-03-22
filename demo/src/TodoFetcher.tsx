import { State } from "@sacdenoeuds/yawn"

export function TodoFetcher() {
  const todoId = new State(1)
  const todo = createTodoFetcher(todoId)

  function setTodoId(event: FocusEvent) {
    const value = Number((event.target as HTMLInputElement).value)
    if (Number.isNaN(value)) return
    todoId.set(value)
  }

  return (
    <div class="vertical-spacer gap-m">
      <div class="vertical-spacer gap-s">
        <label for="todo-id">Todo id (set on blur)</label>
        <input id="todo-id" name="todo-id" onblur={setTodoId} value="1" />
      </div>
      <div>
        {todo.map((state) => {
          switch (state.status) {
            case "pending":
              return <div>Loading…</div>
            case "rejected":
              return <div>Failed to fetch todo</div>
            case "fulfilled":
              return <Todo todo={state.resolved} />
          }
        })}
      </div>
    </div>
  )
}

async function* createTodoFetcher(todoId: AsyncIterable<number>) {
  for await (const id of todoId) {
    yield* fromPromise(fetchTodo(id), (err) => err)
  }
}

function Todo({ todo }: { todo: Todo }) {
  return (
    <ul style="padding-left: 1rem">
      <li>id: {todo.id}</li>
      <li>completed: {todo.completed}</li>
      <li>title: {todo.title}</li>
    </ul>
  )
}

async function fetchTodo(todoId: number): Promise<Todo> {
  // add fake latency
  await new Promise((resolve) => setTimeout(resolve, 1_000))
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${todoId}`,
  )
  const json = await response.json()
  return json
}

interface Todo {
  userId: number
  id: number
  title: string
  completed: boolean
}

type PromiseState<E, T> =
  | { status: "pending" }
  | { status: "rejected"; reason: E }
  | { status: "fulfilled"; resolved: T }

const make = <State extends PromiseState<any, any>>(state: State): State =>
  state

async function* fromPromise<T, E>(
  promise: Promise<T>,
  mapError: (error: unknown) => E,
): AsyncGenerator<PromiseState<E, T>, void, unknown> {
  yield make({ status: "pending" })
  try {
    yield make({ status: "fulfilled", resolved: await promise })
  } catch (error) {
    yield make({ status: "rejected", reason: mapError(error) })
  }
}
