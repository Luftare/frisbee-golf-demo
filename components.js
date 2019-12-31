$ = sel => document.querySelector(sel);
$$ = sel => document.querySelectorAll(sel);
on = (elem, type, hand) => elem.addEventListener(type, hand);

const currentDisc = {
  speed: 9, // not in use
  glide: 4,
  turn: -1,
  fade: 2
};

function forEach(arr, fn) {
  for (let index = 0; index < arr.length; index++) {
    fn(arr[index], index, arr);
  }
}

function map(arr, fn) {
  const res = [];
  for (let index = 0; index < arr.length; index++) {
    res.push(fn(arr[index], index, arr));
  }
  return res;
}

AFRAME.registerComponent('frisbee', {
  schema: {
    inBasket: { default: false },
    isLanded: { default: false },
    didThrow: { default: false },
    isDamped: { default: false },
    dampFactor: { default: 1 },
    maxFlightTime: { default: 7000 }
  },

  init() {
    this.liftForce = new CANNON.Vec3();
    this.airFrictionForce = new CANNON.Vec3();
    this.discUpNormal = new CANNON.Vec3();
    this.center = new CANNON.Vec3();

    this.frisbeeTurn = new THREE.Quaternion();

    this.dampDictionary = {
      terrain: 0.8,
      basket: 0.65
    };

    this.discInBasketCheckScheduled = false;
    this.landingTimerId;

    this.frisbeeMarker = $('#frisbee-marker');

    this.el.addEventListener('throw', e => {
      this.el.body.angularFactor.set(0.5, 1, 0.5);
      this.handleThrow();
    });

    this.el.addEventListener('pick-up', () => {
      this.handlePickUp();
    });

    this.el.addEventListener('inside-trigger-zone', e => {
      this.handleInsideZone(e);
    });
  },

  handleThrow() {
    this.data.didThrow = true;
    this.data.isLanded = false;

    this.frisbeeMarker.setAttribute('visible', false);
    clearTimeout(this.landingTimerId);

    this.landingTimerId = setTimeout(() => {
      this.handleLanded();
    }, this.data.maxFlightTime);
  },

  handlePickUp() {
    this.data.isLanded = false;
    this.data.didThrow = false;
    this.data.inBasket = false;

    clearTimeout(this.landingTimerId);

    this.el.setAttribute('visible', true);

    forEach($$('[frisbee-marker-part]'), part => {
      part.setAttribute('material', 'color', 'yellow');
    });
  },

  handleInsideZone(e) {
    this.data.dampFactor = this.dampDictionary[e.detail.payload] || 1;
    this.data.isDamped = true;
    const shouldTestIfDiscIsInBasket = e.detail.payload === 'basket';
    !this.data.inBasket && !this.discInBasketCheckScheduled;

    if (shouldTestIfDiscIsInBasket) {
      this.discInBasketCheckScheduled = true;

      setTimeout(() => {
        this.data.inBasket = this.data.isDamped;
        this.discInBasketCheckScheduled = false;

        if (this.data.inBasket) {
          this.handleFrisbeeInBasket();
        }
      }, 1000);
    }
  },

  handleFrisbeeInBasket() {
    clearTimeout(this.landingTimerId);
    this.el.setAttribute('visible', true);

    forEach($$('[frisbee-marker-part]'), part => {
      part.setAttribute('material', 'color', 'lightgreen');
    });
  },

  handleLanded() {
    clearTimeout(this.landingTimerId);

    this.frisbeeMarker.setAttribute('position', this.el.body.position);
    this.frisbeeMarker.setAttribute('visible', true);

    if (!this.data.isDamped) {
      this.el.setAttribute('visible', false);
    }
  },

  tick() {
    if (!this.el.body) return;

    this.discUpNormal.set(0, 1, 0);

    this.el.body.quaternion.vmult(this.discUpNormal, this.discUpNormal);

    const velocityMagnitude = this.el.body.velocity.length();
    const airFrictionMagnitude = -0.05 * velocityMagnitude ** 2;

    this.airFrictionForce.copy(this.el.body.velocity);
    this.airFrictionForce.normalize();
    this.airFrictionForce.scale(airFrictionMagnitude, this.airFrictionForce);

    const liftDot = this.discUpNormal.dot(this.el.body.velocity);
    const liftMagnitude = -5 * currentDisc.glide * liftDot;

    this.liftForce.copy(this.discUpNormal);
    this.liftForce.scale(liftMagnitude, this.liftForce);

    const shouldTestIsLanded = this.data.didThrow && !this.data.isLanded;

    if (shouldTestIsLanded) {
      const restLimit = 0.4;
      this.data.isLanded = velocityMagnitude < restLimit;

      if (this.data.isLanded) {
        this.handleLanded();
      }
    }

    if (velocityMagnitude > 1) {
      this.frisbeeTurn.z =
        (currentDisc.fade / 2 + 0.09 * velocityMagnitude * currentDisc.turn) *
        0.003;

      this.el.body.quaternion.mult(this.frisbeeTurn, this.el.body.quaternion);

      this.el.body.applyForce(this.liftForce, this.center);
      this.el.body.applyForce(this.airFrictionForce, this.center);
    }

    this.el.body.velocity.x *= this.data.dampFactor;
    this.el.body.velocity.z *= this.data.dampFactor;

    this.data.dampFactor = 1;
    this.data.isDamped = false;
  }
});

AFRAME.registerComponent('frisbee-thrower', {
  dependencies: ['frisbee', 'frisbee-marker'],

  schema: {
    canThrow: { default: true },
    power: { default: 6 },
    maxVelocity: { default: 20 }
  },

  init() {
    this.didThrow = false;
    this.shouldThrow = false;
    this.throwerPosition = new THREE.Vector3();
    this.frisbeeOrientation = new THREE.Quaternion();
    this.adjustingFrisbeeOrientation = false;

    this.frisbeeMarker = $('#frisbee-marker');
    this.frisbee = $('[frisbee]');

    this.frisbeeMarker.setAttribute(
      'position',
      this.el.getAttribute('position')
    );

    $('#gui__power-value').innerHTML = this.data.power;

    window.addEventListener('mousemove', e => {
      if (this.adjustingFrisbeeOrientation) {
        this.frisbeeOrientation.x += e.movementY * 0.001;
        this.frisbeeOrientation.z -= e.movementX * 0.001;
      }
    });

    window.addEventListener('keydown', ({ key }) => {
      const num = parseInt(key);

      const isNumber = !isNaN(num);
      if (isNumber) {
        const parsedNumber = num === 0 ? 10 : num;
        this.data.power = parsedNumber;
        $('#gui__power-value').innerHTML = parsedNumber;
      }

      if (key === ' ') {
        this.shouldThrow = true;
        this.frisbee.dispatchEvent(new CustomEvent('throw'));
      }
      if (key === 'r') {
        if (!this.didThrow) {
          this.frisbeeOrientation.z = 0;
          this.frisbeeOrientation.x = 0;
        }

        this.frisbeeMarker.setAttribute('visible', true); // REMOVE THIS TO DISABLE FREE THROWING
        this.frisbeeMarker.setAttribute('position', this.throwerPosition); // REMOVE THIS TO DISABLE FREE THROWING
        this.shouldThrow = false;
        this.didThrow = false;

        this.frisbee.dispatchEvent(new CustomEvent('pick-up'));
      }
      if (key === 'i') {
        this.frisbeeOrientation.x -= 0.1;
      }
      if (key === 'k') {
        this.frisbeeOrientation.x += 0.1;
      }
      if (key === 'j') {
        this.frisbeeOrientation.z += 0.1;
      }
      if (key === 'l') {
        this.frisbeeOrientation.z -= 0.1;
      }

      if (key === 'e') {
        const el = $('[look-controls]');

        if (el) {
          el.setAttribute('look-controls', 'enabled', false);
        }

        this.adjustingFrisbeeOrientation = true;
      }
    });

    window.addEventListener('keyup', ({ key }) => {
      if (key === 'e') {
        this.adjustingFrisbeeOrientation = false;
        const el = $('[look-controls]');
        if (el) {
          el.setAttribute('look-controls', 'enabled', true);
        }
      }
    });
  },

  isAtFrisbeeMarker() {
    if (!this.frisbeeMarker || !this.basket) return false;
    const maxDistanceSq = 2 ** 2;
    const markerPosition = this.frisbeeMarker.getAttribute('position');
    const basketPosition = this.basket.getAttribute('position');

    const markerDistanceSq =
      (markerPosition.x - this.throwerPosition.x) ** 2 +
      (markerPosition.z - this.throwerPosition.z) ** 2;
    const basketDistanceSq =
      (basketPosition.x - this.throwerPosition.x) ** 2 +
      (basketPosition.z - this.throwerPosition.z) ** 2;
    const markerBasketDistanceSq =
      (basketPosition.x - markerPosition.x) ** 2 +
      (basketPosition.z - markerPosition.z) ** 2;

    return (
      markerDistanceSq <= maxDistanceSq &&
      basketDistanceSq >= markerBasketDistanceSq
    );
  },

  tick() {
    const cam = this.el.object3D;
    const pos = this.throwerPosition;

    cam.getWorldPosition(pos);

    if (this.didThrow) return;

    const { body } = this.frisbee;
    this.data.canThrow = this.isAtFrisbeeMarker();

    const dist = 1.3;
    const x = -Math.sin(cam.rotation.y) * dist;
    const y = Math.sin(cam.rotation.x) * dist;
    const z = -Math.cos(cam.rotation.y) * dist;

    const toDisc = new CANNON.Vec3(x, y, z);
    const discPos = new CANNON.Vec3(pos.x, pos.y, pos.z);

    discPos.x += toDisc.x;
    discPos.y += toDisc.y - 0.3;
    discPos.z += toDisc.z;

    if (this.shouldThrow) {
      this.throw({ x, y, z });
    } else {
      body.position.set(discPos.x, discPos.y, discPos.z);
      body.velocity.setZero();
      body.quaternion.copy(cam.quaternion);
      body.quaternion.mult(this.frisbeeOrientation, body.quaternion);
      body.angularVelocity.setZero();
    }
  },

  getThrowVelocity() {
    const normalizedPower = this.data.power / 10;
    const weightedPower = normalizedPower ** 0.7;
    return weightedPower * this.data.maxVelocity;
  },

  throw({ x, y, z }) {
    const { body } = this.frisbee;

    this.didThrow = true;
    const velocity = new CANNON.Vec3(x, y, z);
    velocity.normalize();
    velocity.scale(this.getThrowVelocity(), velocity);

    body.velocity.x = velocity.x;
    body.velocity.y = velocity.y;
    body.velocity.z = velocity.z;
  }
});

AFRAME.registerComponent('forest', {
  multiple: true,
  schema: {
    count: { default: 10 },
    radius: { default: 20 },
    type: { default: 'a-oak-tree' }
  },
  init() {
    const { x, y, z } = this.el.getAttribute('position');

    [...Array(this.data.count)].forEach(() => {
      const radius = Math.random() * this.data.radius;
      const angle = Math.random() * Math.PI * 2;
      const treeX = Math.cos(angle) * radius + x;
      const treeZ = Math.sin(angle) * radius + z;
      const el = document.createElement(this.data.type);
      el.setAttribute('position', { x: treeX, y, z: treeZ });
      this.el.sceneEl.appendChild(el);
    });
  }
});
