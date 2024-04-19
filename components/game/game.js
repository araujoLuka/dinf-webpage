"use strict";
var gravity = 0.98;
var jumpForce = 20;
var groundLevel = 0;
var maxSpeed = 10;
var forceBase = 1;
var forceMultiplier = 2.5;
var Character = /** @class */ (function () {
    function Character() {
        this.size = 32;
        this.pos = { x: 100, y: 1000 };
        this.vel = { x: 0, y: 0 };
        this.forceX = 0;
        this.isMovingKeyDown = false;
        this.isStopped = false;
        this.sign = 1;
        this.element = document.createElement("div");
        this.element.className = "character";
        this.element.style.width = "".concat(this.size, "px");
        this.element.style.height = "".concat(this.size, "px");
        this.updateElementPos();
        this.listeners();
    }
    Character.prototype.listeners = function () {
        var _this = this;
        document.addEventListener("keydown", function (e) {
            if (e.key === " ") {
                _this.jump();
            }
            else if (e.key === "ArrowRight") {
                _this.moveStep(true);
                _this.isMovingKeyDown = true;
            }
            else if (e.key === "ArrowLeft") {
                _this.moveStep(false);
                _this.isMovingKeyDown = true;
            }
        });
        document.addEventListener("keyup", function (e) {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                _this.isMovingKeyDown = false;
            }
        });
    };
    Character.prototype.onGround = function () {
        return this.pos.y <= groundLevel;
    };
    Character.prototype.getElement = function () {
        return this.element;
    };
    Character.prototype.updateElementPos = function () {
        this.element.style.left = "".concat(this.pos.x, "px");
        this.element.style.bottom = "".concat(this.pos.y, "px");
    };
    Character.prototype.updatePosition = function () {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.updateElementPos();
    };
    Character.prototype.getSize = function () { return this.size; };
    Character.prototype.setPos = function (x, y) {
        this.setX(x);
        this.setY(y);
    };
    Character.prototype.getX = function () { return this.pos.x; };
    Character.prototype.getY = function () { return this.pos.y; };
    Character.prototype.setX = function (x) { this.pos.x = x; };
    Character.prototype.setY = function (y) { this.pos.y = y; };
    Character.prototype.jump = function () {
        if (this.onGround()) {
            this.vel.y = jumpForce;
            this.pos.y++;
        }
    };
    Character.prototype.moveStep = function (toRight) {
        this.sign = toRight ? 1 : -1;
        this.isStopped = false;
        this.forceX = forceBase * this.sign;
    };
    Character.prototype.move = function (toRight) {
        if (this.isStopped)
            return;
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
    };
    Character.prototype.stop = function () {
        this.isStopped = true;
        this.forceX = 0;
        this.vel.x = 0;
    };
    Character.prototype.disaccelerate = function () {
        if (this.isMovingKeyDown)
            return;
        this.forceX /= forceMultiplier;
        this.vel.x *= 0.5;
        if (Math.abs(this.forceX) < 0.1)
            this.stop();
    };
    Character.prototype.gravityForce = function () {
        if (this.onGround()) {
            this.vel.y = 0;
            this.pos.y = groundLevel;
            return;
        }
        this.vel.y -= gravity;
    };
    Character.prototype.pushAway = function (limit, multiplier) {
        if (multiplier === void 0) { multiplier = 2; }
        this.pos.x = limit;
        this.vel.x *= -multiplier;
    };
    Character.prototype.update = function () {
        this.gravityForce();
        this.disaccelerate();
        this.move(this.sign > 0);
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
