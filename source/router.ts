/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
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
export class Router<T> extends Class.Null {
  /**
   * Router entries.
   */
  @Class.Private()
  private entries: Directory<T> = {};

  /**
   * Entries counter.
   */
  @Class.Private()
  private counter: number = 0;

  /**
   * Router settings.
   */
  @Class.Private()
  private settings: Settings;

  /**
   * Splits the specified path into an array of directories.
   * @param path Path to be splitted.
   * @returns Returns the array of directories.
   */
  @Class.Private()
  private splitPath(path: string): string[] {
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
  @Class.Private()
  private createEntry(pattern?: RegExp, variable?: string): Entry<T> {
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
  @Class.Private()
  private insertEntries(directories: string[], constraint: Constraint): Entry<T> {
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
    return <Entry<T>>entry;
  }

  /**
   * Search all entries that corresponds to the expected directory.
   * @param directory Expected directory.
   * @param entries Entries to select.
   * @returns Returns the selection results.
   */
  @Class.Private()
  private searchEntries(directory: string, entries: Directory<T>): Selection<T> {
    const selection = <Selection<T>>{ directories: [], entries: [], variables: {} };
    for (const current in entries) {
      const entry = entries[current];
      if (entry.pattern && entry.variable) {
        let match;
        if ((match = entry.pattern.exec(directory))) {
          selection.variables[entry.variable] = directory;
          selection.entries.push(entry);
        }
      } else if (current === directory) {
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
        selection.directories.push(<string>directories.shift());
      }

      if (tempEntries.length) {
        selection.entries = tempEntries;
        selection.variables = variables;
      }
    }

    return selection;
  }

  /**
   * Default constructor.
   * @param settings Router settings.
   */
  constructor(settings: Settings) {
    super();
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
      const entry = this.insertEntries(this.splitPath(route.path), route.constraint || {});
      const event = { environment: route.environment, callback: route.onMatch };
      if (route.exact) {
        entry.exact.push(event);
      } else {
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
  @Class.Public()
  public match(path: string, detail: T): Match<T> {
    const directories = this.splitPath(path);
    const selection = this.collectEntries(directories);
    const pipeline = new Pipeline.Subject<Match<T>>();
    const variables = <Variables[]>[];
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
    return new Match(collected, remaining, variables, detail, pipeline);
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
