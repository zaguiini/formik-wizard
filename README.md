# formik-wizard

A multi-step form component powered by [`formik`](https://github.com/jaredpalmer/formik) and [`react-albus`](https://github.com/americanexpress/react-albus).

## Why?

Large forms are generally bad for User Experience: it becomes both tiresome to fill and, in most of the cases, it gets slow.
I've built this lib to tackle this problem: dividing one big form in multiple smaller forms, it gets much easier to reason about,
both as a developer and as a user.

All the smaller forms may include validation (powered by [`yup`](https://github.com/jquense/yup)) and default values.

You can check the demo [here](http://formik-wizard.surge.sh/), with the corresponding source code [here](./example).

## Installation

You need to have `formik` and `react-albus` installed -- they are peer dependencies.
After that, just `yarn add formik-wizard` and you're good to go!

**If you plan to validate the sections, you need to install `yup` as well!**

## Usage

Check out the [example](./example) source code and the [typings](./src/types.ts).
There's a hook called `useFormikWizard` that you can use to read and write sections values and form statuses.
I recommend using [`immer`](https://github.com/mweststrate/immer) because you're modifying the steps data directly!

## License

MIT

## Credits

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).
