AFRAME.registerComponent('bush', {
  init() {
    const children = `
      <a-entity gltf-model="#bush-model" scale="0.03 0.03 0.03" position="0 -0.1 0"></a-entity>
      <a-cylinder radius="1" height="1.5" material="color: #888; opacity: 0.0; transparent: true;" position="0 -0.5 0" trigger-cylinder="selector: [frisbee]"></a-cylinder>
    `;

    this.el.innerHTML = children;
  }
});

AFRAME.registerPrimitive('a-bush', {
  defaultComponents: {
    'bush': {},
  },

  mappings: {

  }
});