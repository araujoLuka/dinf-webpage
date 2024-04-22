"use strict";
var gravity = 0.98;
var jumpForce = 25;
var maxSpeed = 10;
var baseSpeed = 5;
var forceIncrement = 0.2;
var maxForce = 2;
var airTurnSpeed = 3;
var DirectionX;
(function (DirectionX) {
    DirectionX[DirectionX["Left"] = -1] = "Left";
    DirectionX[DirectionX["Stop"] = 0] = "Stop";
    DirectionX[DirectionX["Right"] = 1] = "Right";
})(DirectionX || (DirectionX = {}));
var KeyCodes;
(function (KeyCodes) {
    KeyCodes[KeyCodes["Space"] = 32] = "Space";
    KeyCodes[KeyCodes["ArrowRight"] = 39] = "ArrowRight";
    KeyCodes[KeyCodes["ArrowLeft"] = 37] = "ArrowLeft";
})(KeyCodes || (KeyCodes = {}));
var Character = /** @class */ (function () {
    function Character(canvas, pos, color, size) {
        if (pos === void 0) { pos = { x: 100, y: 1000 }; }
        if (color === void 0) { color = "red"; }
        if (size === void 0) { size = 32; }
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
    Character.prototype.listeners = function () {
        var _this = this;
        document.addEventListener("keydown", function (e) {
            if (e.key === " ")
                _this.keys.space = true;
            else if (e.key === "ArrowRight") {
                _this.keys.arrowRight = true;
            }
            else if (e.key === "ArrowLeft") {
                _this.keys.arrowLeft = true;
            }
        });
        document.addEventListener("keyup", function (e) {
            if (e.key === " ") {
                _this.keys.space = false;
            }
            else if (e.key === "ArrowRight") {
                _this.keys.arrowRight = false;
            }
            else if (e.key === "ArrowLeft") {
                _this.keys.arrowLeft = false;
            }
        });
    };
    Character.prototype.update = function () {
        if (this.keys.space)
            this.jump();
        if (this.isBothKeysPressed())
            this.stop();
        else if (this.keys.arrowLeft)
            this.move(DirectionX.Left);
        else if (this.keys.arrowRight)
            this.move(DirectionX.Right);
        this.nextPos();
        this.draw();
    };
    Character.prototype.getSize = function () {
        return this.size;
    };
    Character.prototype.getPos = function () {
        return this.pos;
    };
    Character.prototype.setPos = function (x, y) {
        this.setX(x);
        this.setY(y);
    };
    Character.prototype.getX = function () {
        return this.pos.x;
    };
    Character.prototype.getY = function () {
        return this.pos.y;
    };
    Character.prototype.setX = function (x) {
        this.pos.x = x;
    };
    Character.prototype.setY = function (y) {
        this.pos.y = y;
    };
    Character.prototype.onGround = function () {
        return this.pos.y >= this.groundLevel;
    };
    Character.prototype.draw = function () {
        var ctx = this.canvas.getContext("2d");
        if (!ctx)
            throw new Error("Canvas not found");
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.size, this.size);
    };
    Character.prototype.nextPos = function () {
        this.pos.x += this.vel.x;
        this.pos.y -= this.vel.y;
        this.disaccelerate();
        this.gravityForce();
    };
    Character.prototype.jump = function () {
        if (this.onGround()) {
            this.vel.y = jumpForce;
            this.pos.y--;
        }
    };
    Character.prototype.moveStep = function (direction) {
        this.isStopped = false;
        this.lastDirection = direction;
        this.sign = direction;
        this.vel.x = baseSpeed * this.sign;
        this.forceX = forceIncrement * this.sign;
    };
    Character.prototype.move = function (direction) {
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
    };
    Character.prototype.stop = function () {
        this.isStopped = true;
        this.forceX = 0;
        this.vel.x = 0;
    };
    Character.prototype.validateDirection = function () {
        // Check velocity and key pressed
        if (this.vel.x < 0 && !this.keys.arrowLeft ||
            this.vel.x > 0 && !this.keys.arrowRight) {
            if (this.keys.arrowLeft)
                this.move(DirectionX.Left);
            else if (this.keys.arrowRight)
                this.move(DirectionX.Right);
            else
                this.stop();
        }
    };
    Character.prototype.isMovingKeyPressed = function () {
        return this.keys.arrowLeft || this.keys.arrowRight;
    };
    Character.prototype.isBothKeysPressed = function () {
        return this.keys.arrowLeft && this.keys.arrowRight;
    };
    Character.prototype.disaccelerate = function () {
        if (this.isMovingKeyPressed())
            return;
        this.forceX = 0;
        this.vel.x *= 0.3;
        if (Math.abs(this.vel.x) < 0.1)
            this.stop();
    };
    Character.prototype.gravityForce = function () {
        if (this.onGround()) {
            this.vel.y = 0;
            this.pos.y = this.groundLevel;
        }
        this.vel.y -= gravity;
    };
    Character.prototype.pushAway = function (limit, multiplier) {
        if (multiplier === void 0) { multiplier = 5; }
        this.pos.x = limit;
        this.stop();
    };
    return Character;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "gameContainer";
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = null;
        this.character = new Character(this.canvas);
        this.leftLimit = 50;
        this.rightLimit = window.innerWidth - this.leftLimit;
    }
    Game.prototype.start = function () {
        var _this = this;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        if (!this.ctx)
            throw new Error("Canvas not found");
        setInterval(function () { return _this.update(); }, 10);
    };
    Game.prototype.checkLimits = function () {
        var size = this.character.getSize();
        if (this.character.getX() < this.leftLimit)
            this.character.pushAway(this.leftLimit);
        else if (this.character.getX() + size > this.rightLimit)
            this.character.pushAway(this.rightLimit - size);
    };
    Game.prototype.update = function () {
        var _a;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.rightLimit = window.innerWidth - this.leftLimit;
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.checkLimits();
        this.character.update();
    };
    return Game;
}());
var game = new Game();
game.start();
