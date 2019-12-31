AFRAME.registerComponent('pine-tree', {
  init() {
    const children = `
      <a-entity gltf-model="#pine-model" scale="0.03 0.03 0.03" position="0 -1 0"></a-entity>
      <a-cylinder visible="false" radius="1" height="3.5" material="color: #888; opacity: 0.0; transparent: true;" position="0 2.2 0" trigger-cylinder="selector: [frisbee]; payload: 0.8;"></a-cylinder>
      <a-cylinder visible="false" radius="0.3" height="10.5" material="color: #888; opacity: 0.0; transparent: true;" static-body></a-cylinder>
    `;

    this.el.innerHTML = children;
  }
});

AFRAME.registerPrimitive('a-pine-tree', {
  defaultComponents: {
    'pine-tree': {}
  },

  mappings: {}
});
