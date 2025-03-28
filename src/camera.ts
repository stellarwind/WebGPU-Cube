// Note: The code in this file does not use the 'dst' output parameter of functions in the
// 'wgpu-matrix' library, so produces many temporary vectors and matrices.
// This is intentional, as this sample prefers readability over performance.
import { Mat4, Vec3, Vec4, mat4, vec3 } from 'wgpu-matrix';
import Input from './input';

// Common interface for camera implementations
export default interface Camera {
  // update updates the camera using the user-input and returns the view matrix.
  update(delta_time: number, input: Input): Mat4;

  // The camera matrix.
  // This is the inverse of the view matrix.
  matrix: Mat4;
  // Alias to column vector 0 of the camera matrix.
  right: Vec4;
  // Alias to column vector 1 of the camera matrix.
  up: Vec4;
  // Alias to column vector 2 of the camera matrix.
  back: Vec4;
  // Alias to column vector 3 of the camera matrix.
  position: Vec4;
}

// The common functionality between camera implementations
class CameraBase {
  // The camera matrix
  private matrix_ = new Float32Array([
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
  ]);

  // The calculated view matrix
  private readonly view_ = mat4.create();

  // Aliases to column vectors of the matrix
  private right_ = new Float32Array(this.matrix_.buffer, 4 * 0, 4);
  private up_ = new Float32Array(this.matrix_.buffer, 4 * 4, 4);
  private back_ = new Float32Array(this.matrix_.buffer, 4 * 8, 4);
  private position_ = new Float32Array(this.matrix_.buffer, 4 * 12, 4);

  // Returns the camera matrix
  get matrix() {
    return this.matrix_;
  }
  // Assigns `mat` to the camera matrix
  set matrix(mat: Mat4) {
    mat4.copy(mat, this.matrix_);
  }

  // Returns the camera view matrix
  get view() {
    return this.view_;
  }
  // Assigns `mat` to the camera view
  set view(mat: Mat4) {
    mat4.copy(mat, this.view_);
  }

  // Returns column vector 0 of the camera matrix
  get right() {
    return this.right_;
  }
  // Assigns `vec` to the first 3 elements of column vector 0 of the camera matrix
  set right(vec: Vec3) {
    vec3.copy(vec, this.right_);
  }

  // Returns column vector 1 of the camera matrix
  get up() {
    return this.up_;
  }
  // Assigns `vec` to the first 3 elements of column vector 1 of the camera matrix
  set up(vec: Vec3) {
    vec3.copy(vec, this.up_);
  }

  // Returns column vector 2 of the camera matrix
  get back() {
    return this.back_;
  }
  // Assigns `vec` to the first 3 elements of column vector 2 of the camera matrix
  set back(vec: Vec3) {
    vec3.copy(vec, this.back_);
  }

  // Returns column vector 3 of the camera matrix
  get position() {
    return this.position_;
  }
  // Assigns `vec` to the first 3 elements of column vector 3 of the camera matrix
  set position(vec: Vec3) {
    vec3.copy(vec, this.position_);
  }
}

// ArcballCamera implements a basic orbiting camera around the world origin
export class ArcballCamera extends CameraBase implements Camera {
  // The camera distance from the target
  private distance = 0;

  // The current angular velocity
  private angularVelocity = 0;

  // The current rotation axis
  private axis_ = vec3.create();

  // Returns the rotation axis
  get axis() {
    return this.axis_;
  }
  // Assigns `vec` to the rotation axis
  set axis(vec: Vec3) {
    vec3.copy(vec, this.axis_);
  }

  // Speed multiplier for camera rotation
  rotationSpeed = 1;

  // Speed multiplier for camera zoom
  zoomSpeed = 0.1;

  // Rotation velocity drag coeffient [0 .. 1]
  // 0: Spins forever
  // 1: Instantly stops spinning
  frictionCoefficient = 0.999;

  // Construtor
  constructor(options?: {
    // The initial position of the camera
    position?: Vec3;
  }) {
    super();
    if (options && options.position) {
      this.position = options.position;
      this.distance = vec3.len(this.position);
      this.back = vec3.normalize(this.position);
      this.recalcuateRight();
      this.recalcuateUp();
    }
  }

  // Returns the camera matrix
  get matrix() {
    return super.matrix;
  }

  // Assigns `mat` to the camera matrix, and recalcuates the distance
  set matrix(mat: Mat4) {
    super.matrix = mat;
    this.distance = vec3.len(this.position);
  }

  update(deltaTime: number, input: Input): Mat4 {
    const epsilon = 0.0000001;

    if (input.analog.touching) {
      // Currently being dragged.
      this.angularVelocity = 0;
    } else {
      // Dampen any existing angular velocity
      this.angularVelocity *= Math.pow(1 - this.frictionCoefficient, deltaTime);
    }

    // Calculate the movement vector
    const movement = vec3.create();
    vec3.addScaled(movement, this.right, input.analog.x, movement);
    vec3.addScaled(movement, this.up, -input.analog.y, movement);

    // Cross the movement vector with the view direction to calculate the rotation axis x magnitude
    const crossProduct = vec3.cross(movement, this.back);

    // Calculate the magnitude of the drag
    const magnitude = vec3.len(crossProduct);

    if (magnitude > epsilon) {
      // Normalize the crossProduct to get the rotation axis
      this.axis = vec3.scale(crossProduct, 1 / magnitude);

      // Remember the current angular velocity. This is used when the touch is released for a fling.
      this.angularVelocity = magnitude * this.rotationSpeed;
    }

    // The rotation around this.axis to apply to the camera matrix this update
    const rotationAngle = this.angularVelocity * deltaTime;
    if (rotationAngle > epsilon) {
      // Rotate the matrix around axis
      // Note: The rotation is not done as a matrix-matrix multiply as the repeated multiplications
      // will quickly introduce substantial error into the matrix.
      this.back = vec3.normalize(rotate(this.back, this.axis, rotationAngle));
      this.recalcuateRight();
      this.recalcuateUp();
    }

    // recalculate `this.position` from `this.back` considering zoom
    if (input.analog.zoom !== 0) {
      this.distance *= 1 + input.analog.zoom * this.zoomSpeed;
    }
    this.position = vec3.scale(this.back, this.distance);

    // Invert the camera matrix to build the view matrix
    this.view = mat4.invert(this.matrix);
    return this.view;
  }

  // Assigns `this.right` with the cross product of `this.up` and `this.back`
  recalcuateRight() {
    this.right = vec3.normalize(vec3.cross(this.up, this.back));
  }

  // Assigns `this.up` with the cross product of `this.back` and `this.right`
  recalcuateUp() {
    this.up = vec3.normalize(vec3.cross(this.back, this.right));
  }
}

// Returns `x` clamped between [`min` .. `max`]
function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max);
}

// Returns `x` float-modulo `div`
function mod(x: number, div: number): number {
  return x - Math.floor(Math.abs(x) / div) * div * Math.sign(x);
}

// Returns `vec` rotated `angle` radians around `axis`
function rotate(vec: Vec3, axis: Vec3, angle: number): Vec3 {
  return vec3.transformMat4Upper3x3(vec, mat4.rotation(axis, angle));
}

// Returns the linear interpolation between 'a' and 'b' using 's'
function lerp(a: Vec3, b: Vec3, s: number): Vec3 {
  return vec3.addScaled(a, vec3.sub(b, a), s);
}