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
const Observable = require("@singleware/observable");
const Pipeline = require("@singleware/pipeline");
const match_1 = require("./match");
/**
 * Generic router class.
 */
let Router = class Router {
    /**
     * Default constructor.
     * @param settings Router settings.
     */
    constructor(settings) {
        /**
         * Router entries.
         */
        this.entries = {};
        /**
         * Entries counter.
         */
        this.counter = 0;
        this.settings = settings;
    }
    /**
     * Splits the specified path into an array of directories.
     * @param path Path to be splitted.
     * @returns Returns the array of directories.
     */
    splitPath(path) {
        const pieces = path.split(this.settings.separator);
        const directories = [];
        for (const directory of pieces) {
            if (directory.length) {
                let match;
                if ((match = directory.match(this.settings.variable)) && match[0].length === directory.length) {
                    directories.push(match[1] || match[0]);
                }
                else {
                    directories.push(`${this.settings.separator}${directory}`);
                }
            }
        }
        if (!directories.length) {
            directories.push(this.settings.separator);
        }
        return directories;
    }
    /**
     * Creates a new empty entry.
     * @param pattern Variable pattern.
     * @param variable Variable name.
     * @returns Returns a new entry instance.
     */
    createEntry(pattern, variable) {
        return {
            pattern: pattern,
            variable: variable,
            entries: {},
            environments: { exact: {}, default: {} },
            onExactMatch: new Observable.Subject(),
            onMatch: new Observable.Subject()
        };
    }
    /**
     * Insert all required entries for the specified array of directories.
     * @param directories Array of directories.
     * @param constraint Path constraint.
     * @returns Returns the last inserted entry.
     */
    insertEntries(directories, constraint) {
        let entries = this.entries;
        let entry;
        for (let directory of directories) {
            let variable, pattern;
            if (directory.indexOf(this.settings.separator) === -1) {
                if (!(pattern = constraint[(variable = directory)])) {
                    throw new Error(`Constraint rules for the variable "${variable}" was not found.`);
                }
                directory = pattern.toString();
            }
            if (!(entry = entries[directory])) {
                entries[directory] = entry = this.createEntry(pattern, variable);
                ++this.counter;
            }
            entries = entry.entries;
        }
        return entry;
    }
    /**
     * Search all entries that corresponds to the expected directory.
     * @param expected Expected directory.
     * @param entries Entries to select.
     * @returns Returns the selection results.
     */
    searchEntries(expected, entries) {
        const selection = { directories: [], entries: [], variables: {} };
        const value = expected.substr(this.settings.separator.length);
        for (const directory in entries) {
            const entry = entries[directory];
            if (entry.pattern && entry.variable) {
                let match;
                if ((match = value.match(entry.pattern)) && match[0].length === value.length) {
                    selection.variables[entry.variable] = value;
                    selection.entries.push(entry);
                }
            }
            else if (directory === expected) {
                selection.entries.push(entry);
            }
        }
        return selection;
    }
    /**
     * Collect all entries that corresponds to the specified array of directories.
     * The array of directories will be reduced according to the number of entries found.
     * @param directories Array of directories.
     * @returns Returns the selection results.
     */
    collectEntries(directories) {
        let selection = { directories: [], entries: [], variables: {} };
        let targets = [this.entries];
        while (directories.length && targets.length) {
            const directory = directories[0];
            const tempTargets = [];
            const tempEntries = [];
            let tempVariables = {};
            for (const entries of targets) {
                const tempSelection = this.searchEntries(directory, entries);
                tempVariables = { ...tempSelection.variables, ...tempVariables };
                for (const entry of tempSelection.entries) {
                    tempEntries.push(entry);
                    tempTargets.push(entry.entries);
                }
            }
            targets = tempTargets;
            if (tempEntries.length) {
                selection.entries = tempEntries;
                selection.variables = { ...tempVariables, ...selection.variables };
                selection.directories.push(directories.shift());
            }
        }
        return selection;
    }
    /**
     * Number of routes.
     */
    get length() {
        return this.counter;
    }
    /**
     * Adds the specified routes into the router.
     * @param routes List of routes.
     * @returns Returns the own instance.
     */
    add(...routes) {
        for (const route of routes) {
            const directories = this.splitPath(route.path);
            const entry = this.insertEntries(directories, route.constraint || {});
            if (route.exact) {
                entry.onExactMatch.subscribe(route.onMatch);
                entry.environments.exact = { ...route.environment, ...entry.environments.exact };
            }
            else {
                entry.onMatch.subscribe(route.onMatch);
                entry.environments.default = { ...route.environment, ...entry.environments.default };
            }
        }
        return this;
    }
    /**
     * Match all routes that corresponds to the specified path.
     * @param path Route path.
     * @param detail Extra details data for notifications.
     * @returns Returns the manager for the matched routes.
     */
    match(path, detail) {
        const directories = this.splitPath(path);
        const selection = this.collectEntries(directories);
        if (!selection.entries.length) {
            selection.directories.push(this.settings.separator);
            if (this.entries[this.settings.separator]) {
                selection.entries.push(this.entries[this.settings.separator]);
            }
        }
        const events = new Pipeline.Subject();
        const variables = [];
        const remaining = directories.join('');
        const analysed = selection.directories.join('');
        for (const entry of selection.entries) {
            if (entry.onExactMatch.length && remaining.length === 0) {
                events.subscribe(entry.onExactMatch);
                variables.push({ ...selection.variables, ...entry.environments.exact });
            }
            if (entry.onMatch.length) {
                events.subscribe(entry.onMatch);
                variables.push({ ...selection.variables, ...entry.environments.default });
            }
        }
        return new match_1.Match(analysed, remaining, variables, detail, events);
    }
    /**
     * Clear the router.
     * @returns Returns the own instance.
     */
    clear() {
        this.entries = {};
        this.counter = 0;
        return this;
    }
};
__decorate([
    Class.Private()
], Router.prototype, "entries", void 0);
__decorate([
    Class.Private()
], Router.prototype, "counter", void 0);
__decorate([
    Class.Private()
], Router.prototype, "settings", void 0);
__decorate([
    Class.Private()
], Router.prototype, "splitPath", null);
__decorate([
    Class.Private()
], Router.prototype, "createEntry", null);
__decorate([
    Class.Private()
], Router.prototype, "insertEntries", null);
__decorate([
    Class.Private()
], Router.prototype, "searchEntries", null);
__decorate([
    Class.Private()
], Router.prototype, "collectEntries", null);
__decorate([
    Class.Public()
], Router.prototype, "length", null);
__decorate([
    Class.Public()
], Router.prototype, "add", null);
__decorate([
    Class.Public()
], Router.prototype, "match", null);
__decorate([
    Class.Public()
], Router.prototype, "clear", null);
Router = __decorate([
    Class.Describe()
], Router);
exports.Router = Router;
