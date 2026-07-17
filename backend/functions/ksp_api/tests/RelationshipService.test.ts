import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RelationshipService } from '../src/services/RelationshipService';
import type { IRelationshipRepository, IProvenanceRepository, IEntityRepository } from '../src/shared/repositories/IRepositories';

describe('RelationshipService - getCytoscapeGraph', () => {
    let mockRelRepo: IRelationshipRepository;
    let mockProvRepo: IProvenanceRepository;
    let mockEntityRepo: IEntityRepository;
    let service: RelationshipService;

    beforeEach(() => {
        mockRelRepo = {
            findBySourceId: vi.fn(),
            findByTargetId: vi.fn(),
            findById: vi.fn(),
            create: vi.fn(),
            delete: vi.fn()
        };

        mockProvRepo = {
            findById: vi.fn(),
            findByEntityId: vi.fn(),
            create: vi.fn(),
            delete: vi.fn()
        };

        mockEntityRepo = {
            findById: vi.fn(),
            findAll: vi.fn(),
            findByName: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn()
        };

        service = new RelationshipService(mockRelRepo, mockProvRepo, mockEntityRepo);
    });

    it('should generate a valid Cytoscape graph array', async () => {
        // Mock Entity
        vi.mocked(mockEntityRepo.findById).mockImplementation((id) => {
            if (id === 'CASE-1') return { id: 'CASE-1', name: 'FIR-100', type: 'Case', createdAt: '', updatedAt: '' };
            if (id === 'ACCUSED-1') return { id: 'ACCUSED-1', name: 'John Doe', type: 'Accused', createdAt: '', updatedAt: '' };
            return undefined;
        });

        // Mock Relationships
        vi.mocked(mockRelRepo.findBySourceId).mockReturnValue([
            { id: 'rel-1', sourceId: 'CASE-1', targetId: 'ACCUSED-1', type: 'ACCUSED_IN', createdAt: '', updatedAt: '' }
        ]);
        vi.mocked(mockRelRepo.findByTargetId).mockReturnValue([]);
        vi.mocked(mockProvRepo.findByEntityId).mockReturnValue([]);

        const graph = await service.getCytoscapeGraph('CASE-1');
        
        expect(Array.isArray(graph)).toBe(true);
        expect(graph.length).toBe(3); // Source node, target node, edge
        
        // Find edge
        const edge = graph.find(e => e.data.source === 'CASE-1' && e.data.target === 'ACCUSED-1');
        expect(edge).toBeDefined();
        
        // Find nodes
        const caseNode = graph.find(e => e.data.id === 'CASE-1');
        expect(caseNode).toBeDefined();
        expect(caseNode?.data.label).toBe('FIR-100');
    });
});
