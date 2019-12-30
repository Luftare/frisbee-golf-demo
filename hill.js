AFRAME.registerComponent('hill', {
  init() {
    const height = parseFloat(this.el.getAttribute('height') || 2);
    const radius = parseFloat(this.el.getAttribute('radius') || 40);
    const y = height - radius;
    const children = `
      <a-sphere radius="${radius}" position="0 ${y} 0" material="color: green;" static-body></a-sphere>
    `;

    this.el.innerHTML = children;
  }
});

AFRAME.registerPrimitive('a-hill', {
  defaultComponents: {
    'hill': {},
  },

  mappings: {

  }
});