"use strict";
var gravity = 0.98;
var jumpForce = 20;
var groundLevel = 0;
var maxSpeed = 10;
var baseSpeed = 6;
var forceIncrement = 0.1;
var maxForce = 1;
var airTurnSpeed = 3;
var DirectionX;
(function (DirectionX) {
    DirectionX[DirectionX["Left"] = -1] = "Left";
    DirectionX[DirectionX["Stop"] = 0] = "Stop";
    DirectionX[DirectionX["Right"] = 1] = "Right";
})(DirectionX || (DirectionX = {}));
var Character = /** @class */ (function () {
    function Character() {
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
                _this.move(DirectionX.Right);
            }
            else if (e.key === "ArrowLeft") {
                _this.move(DirectionX.Left);
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
    Character.prototype.moveStep = function (direction) {
        this.isStopped = false;
        this.isMovingKeyDown = true;
        this.lastDirection = direction;
        this.sign = direction;
        this.vel.x = baseSpeed * this.sign;
        this.forceX = forceIncrement * this.sign;
    };
    Character.prototype.move = function (direction) {
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
    };
    Character.prototype.stop = function () {
        this.isStopped = true;
        this.forceX = 0;
        this.vel.x = 0;
    };
    Character.prototype.disaccelerate = function () {
        if (this.isMovingKeyDown)
            return;
        this.forceX = 0;
        this.vel.x *= 0.3;
        if (Math.abs(this.vel.x) < 0.1)
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
        if (multiplier === void 0) { multiplier = 5; }
        this.pos.x = limit;
        this.stop();
        this.updateElementPos();
    };
    Character.prototype.update = function () {
        this.gravityForce();
        this.disaccelerate();
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
    Game.prototype.checkLimits = function () {
        this.leftLimit = 50;
        this.rightLimit = window.innerWidth - this.character.getSize();
        this.rightLimit -= this.leftLimit;
        if (this.character.getX() < this.leftLimit)
            this.character.pushAway(this.leftLimit);
        else if (this.character.getX() > this.rightLimit)
            this.character.pushAway(this.rightLimit);
    };
    Game.prototype.update = function () {
        this.character.update();
        if (this.character.getY() < groundLevel) {
            this.character.setY(groundLevel);
        }
        this.checkLimits();
    };
    return Game;
}());
var game = new Game();
game.start();
