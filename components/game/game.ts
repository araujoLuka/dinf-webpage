const gravity: number = 0.98;
const jumpForce: number = 25;
const maxSpeed: number = 10;
const baseSpeed: number = 5;
const forceIncrement: number = 0.2;
const maxForce: number = 2;
const airTurnSpeed: number = 3;

interface Vector {
	x: number;
	y: number;
}

enum DirectionX {
	Left = -1,
	Stop = 0,
	Right = 1,
}

enum KeyCodes {
    Space = 32,
    ArrowRight = 39,
    ArrowLeft = 37,
}

interface Keys {
    space: boolean;
    arrowRight: boolean;
    arrowLeft: boolean;
}

class Character {
    private canvas: HTMLCanvasElement;
	private color: string;
	private size: number;
	private pos: Vector;
	private vel: Vector;
	private forceX: number;
    private keys: Keys;
	private isStopped: boolean;
	private sign: number;
	private lastDirection: DirectionX;
    private groundLevel: number;

	constructor(
        canvas: HTMLCanvasElement,
		pos: Vector = { x: 100, y: 1000 },
		color: string = "red",
		size: number = 32,
	) {
        this.canvas = canvas;
		this.color = color;
		this.pos = pos;
		this.size = size;
		this.vel = { x: 0, y: 0 };
		this.forceX = 0;
        this.keys = { space: false, arrowRight: false, arrowLeft: false };
		this.isStopped = false;
		this.sign = 1;
		this.lastDirection = DirectionX.Stop;
        this.groundLevel = this.canvas.height - this.size;

		this.update();

		this.listeners();
	}

	listeners() {
		document.addEventListener("keydown", e => {
			if (e.key === " ")
                this.keys.space = true;
			else if (e.key === "ArrowRight") {
                this.keys.arrowRight = true;
            }
			else if (e.key === "ArrowLeft") {
                this.keys.arrowLeft = true;
            }
		});

		document.addEventListener("keyup", e => {
            if (e.key === " ") {
                this.keys.space = false;
            }
            else if (e.key === "ArrowRight") {
                this.keys.arrowRight = false;
            }
            else if (e.key === "ArrowLeft") {
                this.keys.arrowLeft = false;
            }
		});
	}

	update() {
        if (this.keys.space) this.jump();
        if (this.isBothKeysPressed()) this.stop();
        else if (this.keys.arrowLeft) this.move(DirectionX.Left);
        else if (this.keys.arrowRight) this.move(DirectionX.Right);
        this.nextPos();
		this.draw();
	}

    getSize(): number {
        return this.size;
    }

    getPos(): Vector {
        return this.pos;
    }

	setPos(x: number, y: number) {
		this.setX(x);
		this.setY(y);
	}

	getX(): number {
		return this.pos.x;
	}

	getY(): number {
		return this.pos.y;
	}

	setX(x: number) {
		this.pos.x = x;
	}

	setY(y: number) {
		this.pos.y = y;
	}

	private onGround(): boolean {
		return this.pos.y >= this.groundLevel;
	}

	private draw(): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not found");
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.size, this.size);
    }

	private nextPos(): void {
		this.pos.x += this.vel.x;
		this.pos.y -= this.vel.y;
		this.disaccelerate();
		this.gravityForce();
	}

	private jump() {
		if (this.onGround()) {
			this.vel.y = jumpForce;
			this.pos.y--;
		}
	}

	private moveStep(direction: DirectionX) {
		this.isStopped = false;

		this.lastDirection = direction;
		this.sign = direction;

		this.vel.x = baseSpeed * this.sign;
		this.forceX = forceIncrement * this.sign;
	}

	private move(direction: DirectionX) {
        // First move, needs a first step
        // like everything in life
        if (this.isStopped) {
            this.moveStep(direction);
            return;
        }

        // If the direction is different from the last direction
        // you need to a new step (friction)
		if (direction !== this.lastDirection) {
			this.moveStep(direction);
            // If in the air, reduce the speed to simulate
            // air friction (you can't stop instantly in the air)
            if (!this.onGround()) {
                this.vel.x = airTurnSpeed * this.sign;
                return;
            }
            return;
		}


		// Limit speed
		if (Math.abs(this.vel.x) > maxSpeed) {
			this.vel.x = maxSpeed * this.sign;
			return;
		}

        // Check if the moviment is on pressed key same direction
        this.validateDirection();

		// Increase force
		this.forceX += forceIncrement * this.sign;

		// Limit force
		if (Math.abs(this.forceX) > maxForce) {
			this.forceX = maxForce * this.sign;
		}

		// Increase speed
		this.vel.x += this.forceX;
	}

	private stop() {
		this.isStopped = true;
		this.forceX = 0;
		this.vel.x = 0;
	}

    private validateDirection() {
        // Check velocity and key pressed
        if (this.vel.x < 0 && !this.keys.arrowLeft ||
            this.vel.x > 0 && !this.keys.arrowRight) {

            if (this.keys.arrowLeft) this.move(DirectionX.Left);
            else if (this.keys.arrowRight) this.move(DirectionX.Right);
            else this.stop();
        }
    }

    private isMovingKeyPressed(): boolean {
        return this.keys.arrowLeft || this.keys.arrowRight;
    }

    private isBothKeysPressed(): boolean {
        return this.keys.arrowLeft && this.keys.arrowRight;
    }

	private disaccelerate() {
		if (this.isMovingKeyPressed()) return;

		this.forceX = 0;
		this.vel.x *= 0.3;
		if (Math.abs(this.vel.x) < 0.1) this.stop();
	}

	private gravityForce() {
		if (this.onGround()) {
			this.vel.y = 0;
			this.pos.y = this.groundLevel;
		}

		this.vel.y -= gravity;
	}

	pushAway(limit: number, multiplier: number = 5) {
		this.pos.x = limit;
		this.stop();
	}

}

class Game {
	private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
	private character: Character;
	private leftLimit: number;
	private rightLimit: number;

	constructor() {
		this.canvas = document.createElement("canvas");
		this.canvas.id = "game";
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = null;
        this.character = new Character(this.canvas);
		this.leftLimit = 50;
		this.rightLimit = window.innerWidth - this.leftLimit;
	}

	start() {
		document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        if (!this.ctx) throw new Error("Canvas not found");

        setInterval(() => this.update(), 10);
	}

	checkLimits() {
        const size = this.character.getSize();
		if (this.character.getX() < this.leftLimit) this.character.pushAway(this.leftLimit);
		else if (this.character.getX() + size > this.rightLimit) this.character.pushAway(this.rightLimit - size);
	}

	update() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
		this.rightLimit = window.innerWidth - this.leftLimit;
        this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.checkLimits();
		this.character.update();
	}
}

const game = new Game();
game.start();
