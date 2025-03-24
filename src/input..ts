export class Input {
    private canvas: HTMLCanvasElement | null = null;
    private isDragging: boolean = false;
    private altMod: boolean = false;
    private deltaX: number = 0;
    private deltaY: number = 0;

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
            if (event.altKey) this.altMod = true;

            this.deltaX = event.movementX;
            this.deltaY = event.movementY;
        }
    };

    private onMouseUp = () => {
        document.exitPointerLock();
        this.altMod = false;
        this.isDragging = false;
    };
}
