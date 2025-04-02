export class Input {
    private canvas: HTMLCanvasElement | null = null;
    private isDragging: boolean = false;
    private altMod: boolean = false;
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

        requestAnimationFrame(this.update);
    }

    private onMouseDown = () => {
        this.canvas?.requestPointerLock();
        this.isDragging = true;
    };

    private onMouseMove = (event: MouseEvent) => {
        if (document.pointerLockElement === this.canvas) {
            if (event.altKey) this.altMod = true;

            this.deltaX = event.movementX;
            this.deltaY = event.movementY;
        }
    };

    private onMouseUp = () => {
        document.exitPointerLock();
        this.deltaX = 0;
        this.deltaY = 0;
        this.altMod = false;
        this.isDragging = false;
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

        requestAnimationFrame(this.update);
    };
}
