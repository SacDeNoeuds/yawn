# Values

## Stay as close as possible of the Web APIs

Do not reinvent APIs.
Do not require new users to learn new stuff. Or as few as possible.
My mantra is: you know HTML/CSS/JavaScript? You can use the lib with minimal knowledge about how it works.

Everyone knows HTML, be as close to HTML as possible:
For instance, I expect a div to be created like this: `<div onclick={myHandler} />` – notice the lowercase "onclick", like HTML.
I go for a `class` attribute, not `className`.
No `key`, use a plain ol' `id`.
Creating a custom element with JSX works the same as creating a div.

Everyone knows JavaScript, be as close to JavaScript as possible:
I expect a `<div />` to return a div element in js, as if you created it using `document.createElement('div')`.
And a component is a simple function that gets executed once per component instantiation.
onMount, onUnmount ? No, HTML elements get connected and disconnected -> onConnected, onDisconnected.
Expose functions watch/use effect ? No, use JS knowledge to read and/or combine async iterable values. Of course we can help with that via documentation & recipes, though.

Everyone knows CSS, be as close to CSS as possible:
Let's used scoped styles for components, global stylesheets for theming, etc.

I think you get the drill.

