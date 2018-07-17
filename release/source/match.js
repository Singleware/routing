"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Generic match manager class.
 */
let Match = class Match {
    /**
     * Default constructor.
     * @param path Matched path.
     * @param remaining Remaining path.
     * @param variables List of matched variables.
     * @param detail Extra details data for notifications.
     * @param events Pipeline of matched events.
     */
    constructor(path, remaining, variables, detail, events) {
        this.matchPath = path;
        this.matchEvents = events;
        this.matchVariables = variables;
        this.currentVariables = variables.find(() => true);
        this.remainingPath = remaining;
        this.extraDetails = detail;
    }
    /**
     * Current match length.
     */
    get length() {
        return this.matchEvents.length;
    }
    /**
     * Matched path.
     */
    get path() {
        return this.matchPath;
    }
    /**
     * Remaining path.
     */
    get remaining() {
        return this.remainingPath;
    }
    /**
     * Matched variables.
     */
    get variables() {
        return this.currentVariables || {};
    }
    /**
     * Extra details data.
     */
    get detail() {
        return this.extraDetails;
    }
    /**
     * Determines whether it is an exact match or not.
     */
    get exact() {
        return this.remainingPath.length === 0;
    }
    /**
     * Moves to the next matched route and notify it.
     * @returns Returns the own instance.
     */
    nextSync() {
        this.currentVariables = this.matchVariables.shift();
        this.matchEvents.notifyFirstSync(this);
        return this;
    }
    /**
     * Moves to the next matched route and notify it asynchronously.
     * @returns Returns a promise to get the own instance.
     */
    async next() {
        this.currentVariables = this.matchVariables.shift();
        await this.matchEvents.notifyFirst(this);
        return this;
    }
};
__decorate([
    Class.Private()
], Match.prototype, "matchPath", void 0);
__decorate([
    Class.Private()
], Match.prototype, "matchEvents", void 0);
__decorate([
    Class.Private()
], Match.prototype, "matchVariables", void 0);
__decorate([
    Class.Private()
], Match.prototype, "currentVariables", void 0);
__decorate([
    Class.Private()
], Match.prototype, "remainingPath", void 0);
__decorate([
    Class.Private()
], Match.prototype, "extraDetails", void 0);
__decorate([
    Class.Public()
], Match.prototype, "length", null);
__decorate([
    Class.Public()
], Match.prototype, "path", null);
__decorate([
    Class.Public()
], Match.prototype, "remaining", null);
__decorate([
    Class.Public()
], Match.prototype, "variables", null);
__decorate([
    Class.Public()
], Match.prototype, "detail", null);
__decorate([
    Class.Public()
], Match.prototype, "exact", null);
__decorate([
    Class.Public()
], Match.prototype, "nextSync", null);
__decorate([
    Class.Public()
], Match.prototype, "next", null);
Match = __decorate([
    Class.Describe()
], Match);
exports.Match = Match;
