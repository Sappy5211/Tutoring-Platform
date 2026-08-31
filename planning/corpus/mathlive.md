[Skip to main content](https://mathlive.io/mathfield/#__docusaurus_skipToContent_fallback)

`<math-field>`

The Math Editor for the Web

* * *

A flexible, powerful, and accessible way to write math on the web.

* * *

HTML

```
xxxxxxxxxx
```

```
<p>Start typing math below:</p>
```

```
<math-field>
```

```
  x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}
```

```
</math-field>
```

ResetRun

Start typing math below:

x=2a−b±√b2−4ac​​

x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}

```

```

math-field {
border: 1px solid var(--neutral-400);
background: var(--neutral-200);
border-radius: 8px;
padding: 8px;
}
@media (pointer: coarse) {
math-field {
border-radius: 16px;
font-size: 1.25rem;
border: 1px solid var(--neutral-100);
background: var(--neutral-700);
--primary-color: white;
color: white;
padding: 16px;
box-shadow:
inset 4px 4px 16px rgb(0 0 0 / 10%),
inset 2px 2px 8px rgb(0 0 0 / 60%);
--smart-fence-color: white;
--caret-color: var(--blue-400);
--selection-background-color: var(--blue-300);
--contains-highlight-background-color: var(--blue-900);
}
math-field:focus {
outline: 4px solid rgb(255 255 255 / 25%);
}
math-field::part(virtual-keyboard-toggle), math-field::part(menu-toggle) {
color: white;
}
}

<p>Start typing math below:</p>
<math-field>
x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}
</math-field>

## Why MathField?

## Built on LaTeX

![](https://mathlive.io/img/mathfield/loop-eqn.png)

The gold standard, for beautiful math typesetting.

Mathfields support **800 LaTeX commands**.

[Learn More](https://mathlive.io/mathfield/reference/commands/)

## Math Virtual Keyboards

![](https://mathlive.io/img/mathfield/virtualKeyboard.png)

Fully **customizable** and makes math input easy on **desktop and mobile**.

[Learn More](https://mathlive.io/mathfield/virtual-keyboard/)

## Open Source & Extensible

MathField is an **open source** project available on GitHub. Contributions are welcome.

[View on GitHub](https://github.com/arnog/mathlive)

Individuals and commercial partners are encouraged to [support financially](https://paypal.me/arnogourdol) the project.

[Donate with PayPal](https://paypal.me/arnogourdol)

## What Can You Do with MathField?

### E-Learning Made Engaging [​](https://mathlive.io/mathfield/\#e-learning-made-engaging "Direct link to E-Learning Made Engaging")

Enable interactive math quizzes, exercises, and problem-solving tools that check answers in real-time

[Read this step-by-step tutorial to build a **simple quiz**](https://mathlive.io/tutorials/simple-quiz/)

[Learn more about authoring **fill-in-the-blank** questions](https://mathlive.io/mathfield/guides/fill-in-the-blank/)

### Scientific Computing & Research [​](https://mathlive.io/mathfield/\#scientific-computing--research "Direct link to Scientific Computing & Research")

Render complex formulas and let users symbolically manipulate equations.

[Use mathfields with the **Compute Engine**](https://mathlive.io/compute-engine/guides/symbolic-computing/)

### Interactive Online Calculators [​](https://mathlive.io/mathfield/\#interactive-online-calculators "Direct link to Interactive Online Calculators")

Build real-time calculators that evaluate math expressions dynamically

[Use the **Compute Engine** to evaluate the user's input](https://mathlive.io/compute-engine/guides/numeric-evaluation/)

### Beautiful Math Documentation [​](https://mathlive.io/mathfield/\#beautiful-math-documentation "Direct link to Beautiful Math Documentation")

Embed math seamlessly in **blogs**, **wikis**, and **papers**, ensuring clarity and readability