import * as Pipeline from '@singleware/pipeline';
import { Variables } from './variables';
/**
 * Generic match manager class.
 */
export declare class Match<T> {
    /**
     * Matched path.
     */
    private matchPath;
    /**
     * Pipeline of matched events.
     */
    private matchEvents;
    /**
     * List of matched variables.
     */
    private matchVariables;
    /**
     * Current variables.
     */
    private currentVariables?;
    /**
     * Remaining path.
     */
    private remainingPath;
    /**
     * Extra details data.
     */
    private extraDetails;
    /**
     * Current match length.
     */
    readonly length: number;
    /**
     * Matched path.
     */
    readonly path: string;
    /**
     * Remaining path.
     */
    readonly remaining: string;
    /**
     * Matched variables.
     */
    readonly variables: Variables;
    /**
     * Extra details data.
     */
    readonly detail: T;
    /**
     * Determines whether it is an exact match or not.
     */
    readonly exact: boolean;
    /**
     * Default constructor.
     * @param path Matched path.
     * @param remaining Remaining path.
     * @param variables List of matched variables.
     * @param detail Extra details data for notifications.
     * @param events Pipeline of matched events.
     */
    constructor(path: string, remaining: string, variables: Variables[], detail: T, events: Pipeline.Subject<Match<T>>);
    /**
     * Moves to the next matched route and notify it.
     * @returns Returns the own instance.
     */
    nextSync(): Match<T>;
    /**
     * Moves to the next matched route and notify it asynchronously.
     * @returns Returns a promise to get the own instance.
     */
    next(): Promise<Match<T>>;
}
