AFRAME.registerComponent('oak-tree', {
  init() {
    const children = `
      <a-entity gltf-model="#oak-model" scale="0.005 0.005 0.005" position="0 -0.3 0"></a-entity>
      <a-cylinder radius="1.7" height="2" material="color: #888; opacity: 0; transparent: true;" position="0 3.4 0" trigger-cylinder="selector: [frisbee]"></a-cylinder>
      <a-cylinder radius="0.3" height="7" material="color: #888; opacity: 0; transparent: true;" static-body></a-cylinder>
    `;

    this.el.innerHTML = children;
  }
});

AFRAME.registerPrimitive('a-oak-tree', {
  defaultComponents: {
    'oak-tree': {},
  },

  mappings: {

  }
});