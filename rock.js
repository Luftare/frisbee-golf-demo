AFRAME.registerComponent('rock', {
  init() {
    const children = `
      <a-entity gltf-model="#rock-model" scale="1.1 1.1 1.1" position="0 0 -0.5" rotation="100 0 0"></a-entity>
      <a-sphere radius="0.75"  material="color: #888; opacity: 0.0; transparent: true;" position="0.2 0.8 -0.25" static-body></a-sphere>
      <a-sphere radius="1.05"  material="color: #888; opacity: 0.0; transparent: true;" position="0 -0.2 -0.15" static-body></a-sphere>
    `;

    this.el.innerHTML = children;
  }
});

AFRAME.registerPrimitive('a-rock', {
  defaultComponents: {
    'rock': {},
  },

  mappings: {

  }
});