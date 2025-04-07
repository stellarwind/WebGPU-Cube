export class Input {
    private canvas: HTMLCanvasElement | null = null;

    private deltaX: number = 0;
    private deltaY: number = 0;

    private lastDeltaX: number = 0;
    private lastDeltaY: number = 0;

    public get x() {
        return this.deltaX;
    }

    public get y() {
        return this.deltaY;
    }

    private lastScrollDelta: number = 0;
    private currentScrollDelta: number = 0;

    public get scrollDelta() {
        return this.currentScrollDelta;
    }

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            console.error("Could find Canvas to attach controls");
            return;
        }

        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mouseleave", this.onMouseUp);
        this.canvas.addEventListener("wheel", this.onMouseWheel, {
            passive: true,
        });

        requestAnimationFrame(this.update);
    }

    private onMouseWheel = (event: WheelEvent) => {
        this.currentScrollDelta = event.deltaY;
    };

    private onMouseDown = () => {
        this.canvas?.requestPointerLock();
    };

    private onMouseMove = (event: MouseEvent) => {
        if (document.pointerLockElement === this.canvas) {
            this.deltaX = event.movementX;
            this.deltaY = event.movementY;
        }
    };

    private onMouseUp = () => {
        document.exitPointerLock();
        this.deltaX = 0;
        this.deltaY = 0;
    };

    private update = () => {
        if (
            this.deltaX === this.lastDeltaX &&
            this.deltaY === this.lastDeltaY
        ) {
            this.deltaX = 0;
            this.deltaY = 0;
        }

        this.lastDeltaX = this.deltaX;
        this.lastDeltaY = this.deltaY;

        if (this.lastScrollDelta === this.currentScrollDelta) {
            this.currentScrollDelta = 0;
        }

        this.lastScrollDelta = this.currentScrollDelta;

        requestAnimationFrame(this.update);
    };
}
