/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Pipeline from '@singleware/pipeline';

import { Variables } from './variables';

/**
 * Generic match manager class.
 */
@Class.Describe()
export class Match<T> extends Class.Null {
  /**
   * Matched path.
   */
  @Class.Private()
  private matchPath: string;

  /**
   * Pipeline of matched events.
   */
  @Class.Private()
  private matchEvents: Pipeline.Subject<Match<T>>;

  /**
   * List of matched variables.
   */
  @Class.Private()
  private matchVariables: Variables[];

  /**
   * Current variables.
   */
  @Class.Private()
  private currentVariables?: Variables;

  /**
   * Remaining path.
   */
  @Class.Private()
  private remainingPath: string;

  /**
   * Extra details data.
   */
  @Class.Private()
  private extraDetails: T;

  /**
   * Current match length.
   */
  @Class.Public()
  public get length(): number {
    return this.matchEvents.length;
  }

  /**
   * Matched path.
   */
  @Class.Public()
  public get path(): string {
    return this.matchPath;
  }

  /**
   * Remaining path.
   */
  @Class.Public()
  public get remaining(): string {
    return this.remainingPath;
  }

  /**
   * Matched variables.
   */
  @Class.Public()
  public get variables(): Variables {
    return this.currentVariables || {};
  }

  /**
   * Extra details data.
   */
  @Class.Public()
  public get detail(): T {
    return this.extraDetails;
  }

  /**
   * Determines whether it is an exact match or not.
   */
  @Class.Public()
  public get exact(): boolean {
    return this.remainingPath.length === 0;
  }

  /**
   * Default constructor.
   * @param path Matched path.
   * @param remaining Remaining path.
   * @param variables List of matched variables.
   * @param detail Extra details data for notifications.
   * @param events Pipeline of matched events.
   */
  constructor(path: string, remaining: string, variables: Variables[], detail: T, events: Pipeline.Subject<Match<T>>) {
    super();
    this.matchPath = path;
    this.matchEvents = events;
    this.matchVariables = variables;
    this.currentVariables = variables.shift();
    this.remainingPath = remaining;
    this.extraDetails = detail;
  }

  /**
   * Moves to the next matched route and notify it.
   * @returns Returns the own instance.
   */
  @Class.Public()
  public nextSync(): Match<T> {
    this.matchEvents.notifyFirstSync(this);
    this.currentVariables = this.matchVariables.shift();
    return this;
  }

  /**
   * Moves to the next matched route and notify it asynchronously.
   * @returns Returns a promise to get the own instance.
   */
  @Class.Public()
  public async next(): Promise<Match<T>> {
    await this.matchEvents.notifyFirst(this);
    this.currentVariables = this.matchVariables.shift();
    return this;
  }
}
