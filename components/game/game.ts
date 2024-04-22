const gravity: number = 0.98;
const jumpForce: number = 20;
const groundLevel: number = 0;
const maxSpeed: number = 10;
const baseSpeed: number = 6;
const forceIncrement: number = 0.1;
const maxForce: number = 1;
const airTurnSpeed: number = 3;

interface Vector {
    x: number;
    y: number;
}

enum DirectionX {
    Left = -1,
    Stop = 0,
    Right = 1
}

class Character {
	private element: HTMLElement;
	private size: number;
    private pos: Vector;
    private vel: Vector;
	private forceX: number;
	private isMovingKeyDown: boolean;
    private isStopped: boolean;
    private sign: number;
    private lastDirection: DirectionX;

	constructor() {
		this.size = 32;
        this.pos = { x: 100, y: 1000 };
        this.vel = { x: 0, y: 0 };
		this.forceX = 0;
		this.isMovingKeyDown = false;
        this.isStopped = false;
        this.sign = 1;
        this.lastDirection = DirectionX.Stop;

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
                this.move(DirectionX.Right);
			} else if (e.key === "ArrowLeft") {
				this.move(DirectionX.Left);
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

    moveStep(direction: DirectionX) {
        this.isStopped = false;
        this.isMovingKeyDown = true;

        this.lastDirection = direction;
        this.sign = direction;

        this.vel.x = baseSpeed * this.sign;
        this.forceX = forceIncrement * this.sign;
    }

	move(direction: DirectionX) {
        if (this.isStopped) {
            this.moveStep(direction);
            return;
        }

        // If the character is in the air and the direction is different
        // from the last direction, change the direction and reduce the speed
        // to simulate air friction
        if (!this.onGround() && direction !== this.lastDirection) {
            this.vel.x = airTurnSpeed;
            return;
        }

        if (direction !== this.lastDirection) {
            this.moveStep(direction);
            return;
        }

        // Limit speed
        if (Math.abs(this.vel.x) > maxSpeed) {
            this.vel.x = maxSpeed * this.sign;
            return;
        }

        // Increase force
        this.forceX += forceIncrement * this.sign;

        // Limit force
        if (Math.abs(this.forceX) > maxForce) {
            this.forceX = maxForce * this.sign;
        }

        // Increase speed
        this.vel.x += this.forceX;
	}

	stop() {
        this.isStopped = true;
        this.forceX = 0;
        this.vel.x = 0;
	}

	disaccelerate() {
        if (this.isMovingKeyDown) return;

        this.forceX = 0;
		this.vel.x *= 0.3;
        if (Math.abs(this.vel.x) < 0.1)
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

	pushAway(limit: number, multiplier: number = 5) {
		this.pos.x = limit;
        this.stop();
        this.updateElementPos();
	}

	update() {
		this.gravityForce();
        this.disaccelerate();

		this.updatePosition();
	}
}

class Game {
	private character: Character;
	private element: HTMLElement;
    private leftLimit: number;
    private rightLimit: number;

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

    checkLimits() {
        this.leftLimit = 50
        this.rightLimit = window.innerWidth - this.character.getSize();
        this.rightLimit -= this.leftLimit;

		if (this.character.getX() < this.leftLimit)
			this.character.pushAway(this.leftLimit);
		else if (this.character.getX() > this.rightLimit)
			this.character.pushAway(this.rightLimit);
    }

	update() {
		this.character.update();
		
        if (this.character.getY() < groundLevel) {
			this.character.setY(groundLevel);
		}

        this.checkLimits();
	}
}

const game = new Game();
game.start();
