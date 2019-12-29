// var event = new Event(triggereventname + '_entered');
// this.el.dispatchEvent(event);

AFRAME.registerComponent('trigger-cylinder', {
  multiple: true,
  schema: {
    height: {
      type: 'number',
      default: 1
    },
    radius: {
      type: 'number',
      default: 1
    },
    x: {
      type: 'number',
      default: 0
    },
    y: {
      type: 'number',
      default: 0
    },
    z: {
      type: 'number',
      default: 0
    },
    selector: {
      type: 'string',
      default: '[camera]'
    },
  },

  init() {
    this.position = new THREE.Vector3();
    this.updateDimensions();
  },

  updateDimensions() {
    const { el } = this;

    setTimeout(() => {
      el.object3D.localToWorld(this.position); // THIS IS A HACK
    }, 1000);

    this.radius = parseFloat(el.getAttribute('radius'));
    this.height = parseFloat(el.getAttribute('height'));
    this.radiusSq = this.radius ** 2;
  },

  pointInside({ x, y, z }) {
    const { position } = this;
    const verticalDifference = Math.abs(y - position.y);
    const verticallyInside = verticalDifference < this.height * 0.5;

    if (!verticallyInside) {
      return false
    };

    const distanceXYSq = (position.x - x) ** 2 + (position.z - z) ** 2;
    const insideXY = distanceXYSq < this.radiusSq;

    return insideXY;
  },

  tick: (function () {
    const subscriberPosition = new THREE.Vector3();
    return function () {
      const subscribers = Array.prototype.slice.call(document.querySelectorAll(this.data.selector));

      subscribers.forEach(el => {
        el.object3D.getWorldPosition(subscriberPosition);
        const isInside = this.pointInside(subscriberPosition);

        if (isInside) {
          const event = new CustomEvent('inside-trigger-zone', { detail: { source: this } });
          el.dispatchEvent(event);
        }
      });
    }
  })(),

});