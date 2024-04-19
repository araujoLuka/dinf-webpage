const gravity: number = 0.98;
const jumpForce: number = 20;
const groundLevel: number = 0;
const maxSpeed: number = 25;
const baseAcceleration: number = 2.5;

class Character {
	private element: HTMLElement;
	private size: number;
	private x: number;
	private y: number;
	private vX: number;
	private vY: number;
	private acceleration: number;
	private isMoving: boolean;
	private isJumping: boolean;

	constructor() {
		this.element = document.createElement("div");
		this.element.className = "character";
		this.size = 50;
		this.element.style.width = `${this.size}px`;
		this.element.style.height = `${this.size}px`;
		this.x = 100;
		this.y = 1000;
		this.vX = 0;
		this.vY = 0;
		this.acceleration = 0;
		this.isMoving = false;
		this.isJumping = false;
		this.updateElementPos();
		this.listeners();
	}

	listeners() {
		document.addEventListener("keydown", e => {
			if (e.key === " " && !this.isJumping) {
				this.jump();
			} else if (e.key === "ArrowRight") {
				this.move(true);
			} else if (e.key === "ArrowLeft") {
				this.move(false);
			}
		});

		document.addEventListener("keyup", e => {
			if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
				this.disaccelerate();
			}
		});
	}

	getElement() {
		return this.element;
	}

	updateElementPos() {
		this.element.style.left = `${this.x}px`;
		this.element.style.bottom = `${this.y}px`;
	}

	updatePosition() {
		this.x += this.vX;
		this.y += this.vY;
		this.updateElementPos();
	}

	setPos(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	getSize() {
		return this.size;
	}

	getY() {
		return this.y;
	}

	getX() {
		return this.x;
	}

	setY(y: number) {
		this.y = y;
	}

	setX(x: number) {
		this.x = x;
	}

	jump() {
		if (this.y === groundLevel) {
			this.isJumping = true;
			this.vY = jumpForce;
            this.y += 1; // to avoid instant gravity
		}
	}

	move(toRight: boolean) {
		this.isMoving = true;
		this.acceleration = toRight ? baseAcceleration : -baseAcceleration;
		this.vX += this.acceleration;
		if (Math.abs(this.vX) > maxSpeed) {
			this.vX = toRight ? maxSpeed : -maxSpeed;
		}
	}

	stop() {
		this.vX = 0;
	}

	disaccelerate() {
		this.isMoving = false;

		this.acceleration -= (this.acceleration > 0 ? baseAcceleration : -baseAcceleration) * 3;

		this.vX *= 0.7;
		if (Math.abs(this.vX) < 0.1) {
			this.stop();
		}
	}

	gravityForce() {
		if (this.y <= groundLevel) {
			this.vY = 0;
			this.y = groundLevel;
			this.isJumping = false;
            return;
		}

		this.vY -= gravity;
        if (this.vY < -jumpForce) {
            this.vY = -jumpForce;
        }
	}

	pushAway(limit: number, multiplier: number = 15) {
		this.x = limit;
		this.vX *= -multiplier;
		this.updateElementPos();
	}

	update() {
		this.gravityForce();

		if (this.isMoving) {
			this.move(this.acceleration > 0);
		} else if (this.acceleration !== 0 && Math.abs(this.vX) > 0.1) {
			this.disaccelerate();
		}
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
