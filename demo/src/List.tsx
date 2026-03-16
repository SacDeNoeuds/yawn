type Props = {
    numberOfItems: AsyncIterator<number>;
}
export function List({ numberOfItems }: Props) {
    return (
        <div>
            <div>Number of items: {numberOfItems}</div>
            <ul>
                {numberOfItems.map((numberOfItems) => {
                    return Array.from({ length: numberOfItems }, (_, index) => {
                        return <li>{index + 1}</li>
                    })
                })}
            </ul>
        </div>
    )
}