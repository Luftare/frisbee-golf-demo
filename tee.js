AFRAME.registerComponent("tee", {
  init() {
    this.el.innerHTML = `
      <a-entity text="width: 8; value: ${this.el.getAttribute(
        "text"
      )}; align: center; color: black;" position="1.1 1.01 -2" rotation="-90 0 0"></a-entity>
      <a-box material="color: #944" width="2.99" height="1" depth="0.1" position="0 0.51 -2.44"></a-box>
    `;
  },
});

AFRAME.registerPrimitive("a-tee", {
  defaultComponents: {
    tee: {},
    geometry: {
      primitive: "box",
      width: 3,
      height: 2,
      depth: 5,
    },
    material: {
      color: "#888",
    },
    "static-body": {},
  },

  mappings: {},
});
