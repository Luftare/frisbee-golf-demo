AFRAME.registerComponent('cloud', {
  init() {
    const children = `
      <a-entity gltf-model="#cloud-model" scale="4 4 4"></a-entity>
    `;

    this.el.innerHTML = children;
  }
});

AFRAME.registerPrimitive('a-cloud', {
  defaultComponents: {
    'cloud': {},
  },

  mappings: {

  }
});