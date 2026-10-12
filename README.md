# AI chatbot for React

Ask AI chatbot for React projects, powered by [Biel.ai](https://biel.ai).

![AI chatbot Docusaurus](https://biel.ai/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcarousel-02.d9a9a331.png&w=1200&q=75)

Add AI to your React project using Biel.ai's official plugin.
The integration works with any React site and adds both chat and advanced search capabilities to your project.

*Note: A Biel.ai plan is required to use this plugin. Try it free for 14 days—no credit card required.*

## Key features

- AI chatbot that provides instant responses to queries. 
- AI search engine for quick and relevant information retrieval.
- Integration with React 18+.
- Customizable to match your site's branding and user needs.

## Get started

See the [React AI chatbot integration guide](https://docs.biel.ai/installation/react) for installation and setup instructions.

## Support

Need assistance? [Contact us](https://docs.biel.ai/support) for help.

## License

Copyright (c) 2024 Biel.ai  

Licensed under the [MIT License](LICENSE).

## Package contracts and development

This wrapper declares `biel-search@latest`, so a fresh consumer installation selects the npm `latest` widget release. Existing consumer lockfiles keep their resolved artifact until the dependency is updated. The repository lockfile records version 0.1.94 for reproducible builds. `npm run build` derives the four public proxies (BielBot, BielButton, BielSearchButton and BielSearch) from that installed widget collection, imports its canonical JSX types, and emits CommonJS, ESM and declarations. `require('biel-react')` and `import ... from 'biel-react'` select their respective builds through package exports. Both export `defineCustomElements`; call it in the browser to register the widget.

React and React DOM are peer dependencies supporting 18 and 19. Published declarations preserve widget props, custom event payloads and DOM refs; arrays/objects are assigned as properties, removed listeners are detached, and SSR relies on React's HTML escaping. Rebuilding removes stale generated artifacts.

After `npm ci` and `npm run build`, run `node __tests__/artifact-contract.test.cjs` to pack the actual artifact and install it into isolated React 18.3.1 / 19.3.0 consumers, each using both the default `latest` selection and an explicit 0.1.93 npm override. The check verifies the installed widget version and exercises CJS/ESM exports, the real widget loader and mount, boolean/array/Unicode props, event replacement/removal, refs, SSR escaping and consumer TypeScript types. Provider requests are blocked. This diagnostic leaves the existing test script unchanged.

## Select a widget version

See the [React installation guide](https://docs.biel.ai/installation/react#select-a-widget-version) for npm overrides and lockfile guidance.
