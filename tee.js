AFRAME.registerComponent('tee', {
  init() {
    this.el.innerHTML = `
      <a-box material="color: #944" width="2.99" height="1" depth="0.1" position="0 0.51 -2.44"></a-box>
    `;
  }
});

AFRAME.registerPrimitive('a-tee', {
  defaultComponents: {
    tee: {},
    geometry: {
      primitive: 'box',
      width: 3,
      height: 2,
      depth: 5
    },
    material: {
      color: '#888'
    },
    'static-body': {}
  },

  mappings: {}
});
