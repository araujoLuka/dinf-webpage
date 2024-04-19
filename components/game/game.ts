const gravity: number = 0.98;
const jumpForce: number = 20;
const groundLevel: number = 0;
const maxSpeed: number = 10;
const forceBase: number = 1;
const forceMultiplier: number = 2.5;

interface Vector {
    x: number;
    y: number;
}

class Character {
	private element: HTMLElement;
	private size: number;
	// private x: number;
	// private y: number;
    private pos: Vector;
	// private vX: number;
	// private vY: number;
    private vel: Vector;
	private forceX: number;
	private isMovingKeyDown: boolean;
    private isStopped: boolean;
    private sign: number;

	constructor() {
		this.size = 32;
        this.pos = { x: 100, y: 1000 };
        this.vel = { x: 0, y: 0 };
		this.forceX = 0;
		this.isMovingKeyDown = false;
        this.isStopped = false;
        this.sign = 1;

		this.element = document.createElement("div");
		this.element.className = "character";
		this.element.style.width = `${this.size}px`;
		this.element.style.height = `${this.size}px`;
		this.updateElementPos();

		this.listeners();
	}

	listeners() {
		document.addEventListener("keydown", e => {
			if (e.key === " ") {
				this.jump();
			} else if (e.key === "ArrowRight") {
                this.moveStep(true);
                this.isMovingKeyDown = true;
			} else if (e.key === "ArrowLeft") {
				this.moveStep(false);
                this.isMovingKeyDown = true;
			}
		});

		document.addEventListener("keyup", e => {
			if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                this.isMovingKeyDown = false;
			}
		});
	}

    private onGround(): boolean {
        return this.pos.y <= groundLevel;
    }

	getElement(): HTMLElement {
		return this.element;
	}

	updateElementPos(): void {
		this.element.style.left = `${this.pos.x}px`;
		this.element.style.bottom = `${this.pos.y}px`;
	}

	updatePosition(): void {
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
		this.updateElementPos();
	}

	getSize(): number { return this.size; }

	setPos(x: number, y: number) {
        this.setX(x);
        this.setY(y);
	}

	getX(): number { return this.pos.x; }
    getY(): number { return this.pos.y; }

    setX(x: number) { this.pos.x = x; }
	setY(y: number) { this.pos.y = y; }

	jump() {
		if (this.onGround()) {
			this.vel.y = jumpForce;
            this.pos.y++;
		}
	}

    moveStep(toRight: boolean) {
        this.sign = toRight ? 1 : -1;
        this.isStopped = false;
        this.forceX = forceBase * this.sign;
    }

	move(toRight: boolean) {
        if (this.isStopped) return;

        this.sign = toRight ? 1 : -1;

        // TODO: Refactor
        // - Need to create an accerelation vector
        // - Acceleration vector should be multiplied by the time passed
        // - Increase acceleration with time
        // - Start decelerating when the key is released
        if (this.isMovingKeyDown)
            this.vel.x += this.forceX;

        this.forceX *= forceMultiplier;

        if (Math.abs(this.vel.x) > maxSpeed)
            this.vel.x = maxSpeed * this.sign;
	}

	stop() {
        this.isStopped = true;
        this.forceX = 0;
        this.vel.x = 0;
	}

	disaccelerate() {
        if (this.isMovingKeyDown) return;

        this.forceX /= forceMultiplier;
		this.vel.x *= 0.5;
        if (Math.abs(this.forceX) < 0.1)
            this.stop();
	}

	gravityForce() {
		if (this.onGround()) {
			this.vel.y = 0;
			this.pos.y = groundLevel;
            return;
		}

		this.vel.y -= gravity;
	}

	pushAway(limit: number, multiplier: number = 2) {
		this.pos.x = limit;
		this.vel.x *= -multiplier;
	}

	update() {
		this.gravityForce();
        this.disaccelerate();
        this.move(this.sign > 0);

		this.updatePosition();
	}
}

class Game {
	private character: Character;
	private element: HTMLElement;

	constructor() {
		this.element = document.createElement("div");
		this.element.id = "gameContainer";
		document.body.appendChild(this.element);
		this.character = new Character();
		this.element.appendChild(this.character.getElement());
	}

	start() {
		setInterval(() => {
			this.update();
		}, 1000 / 60);
	}

	update() {
		this.character.update();
		if (this.character.getY() < groundLevel) {
			this.character.setY(groundLevel);
		}
		if (this.character.getX() < 50) {
			this.character.pushAway(60);
		} else if (this.character.getX() + this.character.getSize() > window.innerWidth - 50) {
			this.character.pushAway(window.innerWidth - this.character.getSize() - 60);
		}
	}
}

const game = new Game();
game.start();
