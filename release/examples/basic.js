"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Routing = require("../source");
/**
 * Create a router.
 */
const router = new Routing.Router({
    separator: '/',
    variable: /\{([a-z0-9]+)\}/
});
/**
 * Match and execute routes.
 * @param path Request path.
 * @param detail Request detail.
 */
function request(path, detail) {
    const routes = router.match(path, detail);
    while (routes.length) {
        routes.nextSync();
    }
}
/**
 * Print details of matched route.
 * @param match Current match.
 */
function print(match) {
    console.log(`\tROUTE path: '${match.path}' remaining: '${match.remaining}' detail: '${match.detail}' variables: `, match.variables);
}
/**
 * Adds all routes.
 */
router.add({
    path: '/',
    exact: true,
    environment: { name: 'A', home: 'true' },
    onMatch: (match) => {
        print(match);
    }
}, {
    path: '/',
    environment: { name: 'B', home: 'false' },
    onMatch: (match) => {
        print(match);
    }
}, {
    path: '/action/{id}/edit',
    constraint: {
        id: /[0-9a-z]+/
    },
    environment: { name: 'C', home: 'false' },
    onMatch: (match) => {
        print(match);
    }
}, {
    path: '/action/{id}/edit',
    constraint: {
        id: /[0-9]+/
    },
    environment: { name: 'D', home: 'false' },
    onMatch: (match) => {
        print(match);
    }
});
/**
 * Match routes.
 */
console.log('[INDEX & DEFAULT]');
request('/', 0);
console.log('[DEFAULT]');
request('/unknown', 1);
request('/unknown/rest', 1);
console.log('[ACTION TEXT & NUMBER]');
request('/action/100/edit', 2);
console.log('[ACTION TEXT]');
request('/action/test/edit', 3);
