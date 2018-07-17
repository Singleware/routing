/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Observable from '@singleware/observable';
import * as Pipeline from '@singleware/pipeline';

import { Constraint } from './constraint';
import { Variables } from './variables';
import { Directory } from './directory';
import { Selection } from './selection';
import { Settings } from './settings';
import { Route } from './route';
import { Entry } from './entry';
import { Match } from './match';

/**
 * Generic router class.
 */
@Class.Describe()
export class Router<T> {
  /**
   * Router entries.
   */
  @Class.Private() private entries: Directory<T> = {};

  /**
   * Entries counter.
   */
  @Class.Private() private counter: number = 0;

  /**
   * Router settings.
   */
  @Class.Private() private settings: Settings;

  /**
   * Splits the specified path into an array of directories.
   * @param path Path to be splitted.
   * @returns Returns the array of directories.
   */
  @Class.Private()
  private splitPath(path: string): string[] {
    const pieces = path.split(this.settings.separator);
    const directories = [];

    for (const directory of pieces) {
      if (directory.length) {
        let match;
        if ((match = directory.match(this.settings.variable)) && match[0].length === directory.length) {
          directories.push(match[1] || match[0]);
        } else {
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
  @Class.Private()
  private createEntry(pattern?: RegExp, variable?: string): Entry<T> {
    return {
      pattern: pattern,
      variable: variable,
      entries: {},
      environments: { exact: {}, default: {} },
      onExactMatch: new Observable.Subject<Match<T>>(),
      onMatch: new Observable.Subject<Match<T>>()
    };
  }

  /**
   * Insert all required entries for the specified array of directories.
   * @param directories Array of directories.
   * @param constraint Path constraint.
   * @returns Returns the last inserted entry.
   */
  @Class.Private()
  private insertEntries(directories: string[], constraint: Constraint): Entry<T> {
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

    return <Entry<T>>entry;
  }

  /**
   * Search all entries that corresponds to the expected directory.
   * @param expected Expected directory.
   * @param entries Entries to select.
   * @returns Returns the selection results.
   */
  @Class.Private()
  private searchEntries(expected: string, entries: Directory<T>): Selection<T> {
    const selection = <Selection<T>>{ directories: [], entries: [], variables: {} };
    const value = expected.substr(this.settings.separator.length);

    for (const directory in entries) {
      const entry = entries[directory];
      if (entry.pattern && entry.variable) {
        let match;
        if ((match = value.match(entry.pattern)) && match[0].length === value.length) {
          selection.variables[entry.variable] = value;
          selection.entries.push(entry);
        }
      } else if (directory === expected) {
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
  @Class.Private()
  private collectEntries(directories: string[]): Selection<T> {
    let selection = <Selection<T>>{ directories: [], entries: [], variables: {} };
    let targets = [this.entries];

    while (directories.length && targets.length) {
      const directory = directories[0];
      const tempTargets = [];
      const tempEntries = <Entry<T>[]>[];
      let tempVariables = <Variables>{};

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
        selection.directories.push(<string>directories.shift());
      }
    }

    return selection;
  }

  /**
   * Default constructor.
   * @param settings Router settings.
   */
  constructor(settings: Settings) {
    this.settings = settings;
  }

  /**
   * Number of routes.
   */
  @Class.Public()
  public get length(): number {
    return this.counter;
  }

  /**
   * Adds the specified routes into the router.
   * @param routes List of routes.
   * @returns Returns the own instance.
   */
  @Class.Public()
  public add(...routes: Route<T>[]): Router<T> {
    for (const route of routes) {
      const directories = this.splitPath(route.path);
      const entry = this.insertEntries(directories, route.constraint || {});
      if (route.exact) {
        entry.onExactMatch.subscribe(route.onMatch);
        entry.environments.exact = { ...route.environment, ...entry.environments.exact };
      } else {
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
  @Class.Public()
  public match(path: string, detail: T): Match<T> {
    const directories = this.splitPath(path);
    const selection = this.collectEntries(directories);

    if (!selection.entries.length) {
      selection.directories.push(this.settings.separator);
      if (this.entries[this.settings.separator]) {
        selection.entries.push(this.entries[this.settings.separator]);
      }
    }

    const events = new Pipeline.Subject<Match<T>>();
    const variables = <Variables[]>[];
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

    return new Match(analysed, remaining, variables, detail, events);
  }

  /**
   * Clear the router.
   * @returns Returns the own instance.
   */
  @Class.Public()
  public clear(): Router<T> {
    this.entries = {};
    this.counter = 0;
    return this;
  }
}
