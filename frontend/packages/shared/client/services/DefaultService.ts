/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EntityDossier } from '../models/EntityDossier';
import type { EntityLocation } from '../models/EntityLocation';
import type { RelationshipWithEvidence } from '../models/RelationshipWithEvidence';
import type { SearchResponse } from '../models/SearchResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Federated Search
     * Search across all available intelligence modules (e.g. Person, Vehicle, Case, Phone).
     * @param query Search term or keyword.
     * @param activeModules Comma-separated list of search modules to run (e.g. "Person,Vehicle").
     * @param requireAll If true, limits results to matches across all queried modules.
     * @returns SearchResponse Search results containing results and warnings.
     * @throws ApiError
     */
    public static getApiSearch(
        query: string,
        activeModules?: string,
        requireAll?: boolean,
    ): CancelablePromise<SearchResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/search',
            query: {
                'query': query,
                'activeModules': activeModules,
                'requireAll': requireAll,
            },
        });
    }
    /**
     * Get All Entity Locations
     * Retrieves spatial locations for all entities that have geolocation data.
     * @returns EntityLocation List of entity locations.
     * @throws ApiError
     */
    public static getApiEntitiesLocations(): CancelablePromise<Array<EntityLocation>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/entities/locations',
        });
    }
    /**
     * Get Entities In Bounding Box
     * Retrieves spatial locations for entities within specified bounding box coordinates.
     * @param north Northern latitude boundary
     * @param south Southern latitude boundary
     * @param east Eastern longitude boundary
     * @param west Western longitude boundary
     * @returns EntityLocation List of entity locations inside bounding box.
     * @throws ApiError
     */
    public static getApiEntitiesInBounds(
        north: number,
        south: number,
        east: number,
        west: number,
    ): CancelablePromise<Array<EntityLocation>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/entities/in-bounds',
            query: {
                'north': north,
                'south': south,
                'east': east,
                'west': west,
            },
        });
    }
    /**
     * Get Entity Dossier
     * Retrieves the comprehensive dossier for a given entity, including profile, aliases, network summary, activity timeline, and risks.
     * @param id Unique identifier of the entity.
     * @returns EntityDossier A detailed entity dossier.
     * @throws ApiError
     */
    public static getApiEntitiesDossier(
        id: string,
    ): CancelablePromise<EntityDossier> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/entities/{id}/dossier',
            path: {
                'id': id,
            },
            errors: {
                404: `Entity not found.`,
            },
        });
    }
    /**
     * Get Entity Relationships (One-Hop Network)
     * Retrieves all direct relationships for the specified entity, along with the connected entities and supporting evidence.
     * @param id Unique identifier of the entity.
     * @returns RelationshipWithEvidence List of relationships with evidence.
     * @throws ApiError
     */
    public static getApiEntitiesRelationships(
        id: string,
    ): CancelablePromise<Array<RelationshipWithEvidence>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/entities/{id}/relationships',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Query Timeline Events
     * Retrieves a chronological timeline of events filtered by entity, case, or date range.
     * @param entityId Filter events involving this entity.
     * @param caseId Filter events tied to this case.
     * @param startDate ISO 8601 start date.
     * @param endDate ISO 8601 end date.
     * @returns any A chronological list of events.
     * @throws ApiError
     */
    public static getApiEvents(
        entityId?: string,
        caseId?: string,
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/events',
            query: {
                'entityId': entityId,
                'caseId': caseId,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
}
