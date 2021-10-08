AFRAME.registerComponent("basket", {
  multiple: true,
  schema: {
    labelx: { type: "string" },
  },
  init() {
    const children = `
      <a-entity text="width: 10; value: ${this.el.getAttribute(
        "text"
      )}; align: center; color: black;" position="0 1.62 0"></a-entity>
      <a-cylinder radius="0.5" height="0.2" material="color: #777;" position="0 0.5 0" static-body></a-cylinder>
      <a-cylinder radius="0.05" height="5.5" material="color: #777;" position="0 -1.5 0" static-body></a-cylinder>
      <a-cylinder radius="0.4" height="0.7" material="color: #888; opacity: 0.8; transparent: true;" position="0 0.9 0"
        trigger-cylinder="selector: [frisbee]; payload: basket;">
      </a-cylinder>
      <a-cylinder radius="0.5" height="0.2" material="color: #DD3;" position="0 1.25 0" static-body></a-cylinder>
    `;

    this.el.innerHTML = children;
  },
});

AFRAME.registerPrimitive("a-basket", {
  defaultComponents: {
    basket: {},
  },

  mappings: {},
});
