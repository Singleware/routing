"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Pipeline = require("@singleware/pipeline");
const match_1 = require("./match");
/**
 * Generic router class.
 */
let Router = class Router extends Class.Null {
    /**
     * Default constructor.
     * @param settings Router settings.
     */
    constructor(settings) {
        super();
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
        const directories = [this.settings.separator];
        for (let i = 0; i < pieces.length; ++i) {
            const directory = pieces[i];
            if (directory.length) {
                directories.push(directory);
                if (i + 1 < pieces.length) {
                    directories.push(this.settings.separator);
                }
            }
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
            partial: [],
            exact: []
        };
    }
    /**
     * Inserts all required entries for the specified array of directories.
     * @param directories Array of directories.
     * @param constraint Path constraint.
     * @returns Returns the last inserted entry.
     * @throws Throws an error when the rules for the specified variables was not found.
     */
    insertEntries(directories, constraint) {
        let entries = this.entries;
        let entry;
        for (let directory of directories) {
            let match, variable, pattern;
            if ((match = this.settings.variable.exec(directory))) {
                if (!(pattern = constraint[(variable = match[1])])) {
                    throw new TypeError(`Constraint rules for the variable "${variable}" was not found.`);
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
     * @param directory Expected directory.
     * @param entries Entries to select.
     * @returns Returns the selection results.
     */
    searchEntries(directory, entries) {
        const selection = { directories: [], entries: [], variables: {} };
        for (const current in entries) {
            const entry = entries[current];
            if (entry.pattern && entry.variable) {
                let match;
                if ((match = entry.pattern.exec(directory))) {
                    selection.variables[entry.variable] = directory;
                    selection.entries.push(entry);
                }
            }
            else if (current === directory) {
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
        let variables = {};
        while (directories.length && targets.length) {
            const tempTargets = [];
            const tempEntries = [];
            for (const entries of targets) {
                const tempSearch = this.searchEntries(directories[0], entries);
                variables = { ...tempSearch.variables, ...variables };
                for (const entry of tempSearch.entries) {
                    if (entry.partial.length || entry.exact.length) {
                        tempEntries.push(entry);
                    }
                    tempTargets.push(entry.entries);
                }
            }
            targets = tempTargets;
            if (tempTargets.length) {
                selection.directories.push(directories.shift());
            }
            if (tempEntries.length) {
                selection.entries = tempEntries;
                selection.variables = variables;
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
            const entry = this.insertEntries(this.splitPath(route.path), route.constraint || {});
            const event = { environment: route.environment, callback: route.onMatch };
            if (route.exact) {
                entry.exact.push(event);
            }
            else {
                entry.partial.push(event);
            }
        }
        return this;
    }
    /**
     * Match all routes that corresponds to the specified path.
     * @param path Route path.
     * @param detail Extra details used in the route notification.
     * @returns Returns the manager for the matched routes.
     */
    match(path, detail) {
        const directories = this.splitPath(path);
        const selection = this.collectEntries(directories);
        const pipeline = new Pipeline.Subject();
        const variables = [];
        const remaining = directories.join('');
        const collected = selection.directories.join('');
        for (const entry of selection.entries) {
            if (remaining.length === 0) {
                for (const event of entry.exact) {
                    pipeline.subscribe(event.callback);
                    variables.push({ ...selection.variables, ...event.environment });
                }
            }
            for (const event of entry.partial) {
                pipeline.subscribe(event.callback);
                variables.push({ ...selection.variables, ...event.environment });
            }
        }
        return new match_1.Match(collected, remaining, variables, detail, pipeline);
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
