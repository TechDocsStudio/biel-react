const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const dom = new JSDOM('<div id="root"></div>', {
  url: "https://example.test/",
  pretendToBeVisual: true,
});
for (const name of [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "Element",
  "CustomEvent",
  "customElements",
  "Node",
  "MutationObserver",
  "getComputedStyle",
])
  global[name] =
    name === "window"
      ? dom.window
      : name === "document"
        ? dom.window.document
        : dom.window[name];
global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(
  dom.window,
);
global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
global.IS_REACT_ACT_ENVIRONMENT = true;
global.fetch = async () => {
  throw new Error("Unexpected provider request");
};
dom.window.matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
});
const React = require("react");
const { createRoot } = require("react-dom/client");
const { renderToStaticMarkup } = require("react-dom/server");
const api = require("biel-react");
const act = React.act || require("react-dom/test-utils").act;
const pause = () => new Promise((resolve) => setTimeout(resolve, 30));
(async () => {
  assert.deepEqual(Object.keys(api).sort(), [
    "BielBot",
    "BielButton",
    "BielSearch",
    "BielSearchButton",
    "defineCustomElements",
  ]);
  const esm = await import("biel-react");
  assert.deepEqual(Object.keys(esm).sort(), Object.keys(api).sort());
  assert(process.argv[2], "Expected installed widget version is required");
  assert.equal(require("biel-search/package.json").version, process.argv[2]);
  await api.defineCustomElements(window);
  const props = {
    project: 'quote" 日本語 </script>',
    disableInput: true,
    fetchData: false,
    renderMath: false,
    renderDiagrams: false,
    embeddedMode: true,
    initialMessages: [{ text: "Hello 日本語", sender: "ai", isPartial: false }],
  };
  const ref = React.createRef();
  const root = createRoot(document.getElementById("root"));
  let first = 0,
    second = 0;
  await act(async () => {
    root.render(
      React.createElement(api.BielBot, {
        ...props,
        ref,
        className: "owned",
        onCloseBot: () => first++,
      }),
    );
    await pause();
  });
  const node = ref.current;
  assert(node);
  await node.componentOnReady();
  await pause();
  assert(node.shadowRoot);
  assert.equal(node.project, props.project);
  assert.equal(node.getAttribute("project"), props.project);
  assert.equal(node.disableInput, true);
  assert.equal(node.renderMath, false);
  assert.deepEqual(node.initialMessages, props.initialMessages);
  node.dispatchEvent(new CustomEvent("closeBot"));
  assert.equal(first, 1);
  await act(async () => {
    root.render(
      React.createElement(api.BielBot, {
        ...props,
        ref,
        className: "replacement",
        onCloseBot: () => second++,
      }),
    );
    await pause();
  });
  node.dispatchEvent(new CustomEvent("closeBot"));
  assert.equal(first, 1);
  assert.equal(second, 1);
  assert(!node.classList.contains("owned"));
  await act(async () => {
    root.render(React.createElement(api.BielBot, { ...props, ref }));
    await pause();
  });
  node.dispatchEvent(new CustomEvent("closeBot"));
  assert.equal(second, 1);
  assert(!node.classList.contains("replacement"));
  await act(async () => {
    root.render(
      React.createElement(api.BielSearch, {
        project: "p",
        fetchData: false,
        renderMath: false,
        renderDiagrams: false,
        onMessageSent: () => second++,
      }),
    );
    await pause();
  });
  const search = document.querySelector("biel-search");
  await search.componentOnReady();
  search.dispatchEvent(
    new CustomEvent("messageSent", {
      detail: { message: "query", bielId: "p" },
    }),
  );
  assert.equal(second, 2);
  await act(async () => {
    root.unmount();
    await pause();
  });
  search.dispatchEvent(new CustomEvent("messageSent"));
  assert.equal(second, 2);
  assert.equal(ref.current, null);
  const html = renderToStaticMarkup(React.createElement(api.BielBot, props));
  assert(html.includes("&quot;"));
  assert(html.includes("日本語"));
  assert(!html.includes("</script>"));
  assert(!html.includes("[object Object]"));
  dom.window.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
  dom.window.close();
});
