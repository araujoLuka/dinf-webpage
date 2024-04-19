"use strict";
var gravity = 0.98;
var jumpForce = 20;
var groundLevel = 0;
var maxSpeed = 25;
var baseAcceleration = 2.5;
var Character = /** @class */ (function () {
    function Character() {
        this.element = document.createElement("div");
        this.element.className = "character";
        this.size = 50;
        this.element.style.width = "".concat(this.size, "px");
        this.element.style.height = "".concat(this.size, "px");
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
    Character.prototype.listeners = function () {
        var _this = this;
        document.addEventListener("keydown", function (e) {
            if (e.key === " " && !_this.isJumping) {
                _this.jump();
            }
            else if (e.key === "ArrowRight") {
                _this.move(true);
            }
            else if (e.key === "ArrowLeft") {
                _this.move(false);
            }
        });
        document.addEventListener("keyup", function (e) {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                _this.disaccelerate();
            }
        });
    };
    Character.prototype.getElement = function () {
        return this.element;
    };
    Character.prototype.updateElementPos = function () {
        this.element.style.left = "".concat(this.x, "px");
        this.element.style.bottom = "".concat(this.y, "px");
    };
    Character.prototype.updatePosition = function () {
        this.x += this.vX;
        this.y += this.vY;
        this.updateElementPos();
    };
    Character.prototype.setPos = function (x, y) {
        this.x = x;
        this.y = y;
    };
    Character.prototype.getSize = function () {
        return this.size;
    };
    Character.prototype.getY = function () {
        return this.y;
    };
    Character.prototype.getX = function () {
        return this.x;
    };
    Character.prototype.setY = function (y) {
        this.y = y;
    };
    Character.prototype.setX = function (x) {
        this.x = x;
    };
    Character.prototype.jump = function () {
        if (this.y === groundLevel) {
            this.isJumping = true;
            this.vY = jumpForce;
            this.y += 1; // to avoid instant gravity
        }
    };
    Character.prototype.move = function (toRight) {
        this.isMoving = true;
        this.acceleration = toRight ? baseAcceleration : -baseAcceleration;
        this.vX += this.acceleration;
        if (Math.abs(this.vX) > maxSpeed) {
            this.vX = toRight ? maxSpeed : -maxSpeed;
        }
    };
    Character.prototype.stop = function () {
        this.vX = 0;
    };
    Character.prototype.disaccelerate = function () {
        this.isMoving = false;
        this.acceleration -= (this.acceleration > 0 ? baseAcceleration : -baseAcceleration) * 3;
        this.vX *= 0.7;
        if (Math.abs(this.vX) < 0.1) {
            this.stop();
        }
    };
    Character.prototype.gravityForce = function () {
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
    };
    Character.prototype.pushAway = function (limit, multiplier) {
        if (multiplier === void 0) { multiplier = 15; }
        this.x = limit;
        this.vX *= -multiplier;
        this.updateElementPos();
    };
    Character.prototype.update = function () {
        this.gravityForce();
        if (this.isMoving) {
            this.move(this.acceleration > 0);
        }
        else if (this.acceleration !== 0 && Math.abs(this.vX) > 0.1) {
            this.disaccelerate();
        }
        this.updatePosition();
    };
    return Character;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.element = document.createElement("div");
        this.element.id = "gameContainer";
        document.body.appendChild(this.element);
        this.character = new Character();
        this.element.appendChild(this.character.getElement());
    }
    Game.prototype.start = function () {
        var _this = this;
        setInterval(function () {
            _this.update();
        }, 1000 / 60);
    };
    Game.prototype.update = function () {
        this.character.update();
        if (this.character.getY() < groundLevel) {
            this.character.setY(groundLevel);
        }
        if (this.character.getX() < 50) {
            this.character.pushAway(60);
        }
        else if (this.character.getX() + this.character.getSize() > window.innerWidth - 50) {
            this.character.pushAway(window.innerWidth - this.character.getSize() - 60);
        }
    };
    return Game;
}());
var game = new Game();
game.start();
