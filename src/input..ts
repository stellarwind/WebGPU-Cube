export class Input {
    private canvas: HTMLCanvasElement | null = null;
    private isDragging: boolean = false;
    private altMod: boolean = false;
    // private prevMouseX: number = 0;
    // private prevMouseY: number = 0;

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
    }

    private onMouseDown = () => {
        this.canvas?.requestPointerLock();
        this.isDragging = true;
    };

    private onMouseMove = (event: MouseEvent) => {
        if (document.pointerLockElement === this.canvas) {
            console.log("X Delta: " + event.movementX);
            console.log("Y Delta: " + event.movementY);
        }
    };

    private onMouseUp = (event: MouseEvent) => {
        document.exitPointerLock();
        this.isDragging = false;
    };
}
