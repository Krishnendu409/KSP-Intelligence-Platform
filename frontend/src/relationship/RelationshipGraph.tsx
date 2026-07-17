import { useRef, useState } from "react";
import cytoscape from "cytoscape";
import CytoscapeComponent from "react-cytoscapejs";
import fcose from "cytoscape-fcose";
import { useInvestigationStore } from "../workspace/store/useInvestigationStore";

import { Network, Loader2, Plus, Lock, Unlock, EyeOff, Crosshair, Route, Zap } from "lucide-react";
import { useRelationshipGraphData } from "./useRelationshipGraphData";
import { findShortestPath, OPERATIONAL_SYNDICATE_EDGES, OPERATIONAL_SYNDICATE_NODES } from "../lib/operationalNetworkEngine";

if (typeof cytoscape !== "undefined" && typeof cytoscape.use === "function") {
  cytoscape.use(fcose);
}

export function RelationshipGraph() {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const { focusedEntity, setFocusedEntity } = useInvestigationStore();
  const { elements, loading, selectedNode, setSelectedNode } = useRelationshipGraphData();

  const [pathSource, setPathSource] = useState<string>("PER-8832");
  const [pathTarget, setPathTarget] = useState<string>("ORG-202");
  const [activePath, setActivePath] = useState<string[] | null>(null);

  const handleExpandNode = async (nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;

    try {
      const res = await fetch(`/api/entities/${nodeId}/relationships`);
      if (!res.ok) throw new Error("Failed to fetch relationships");
      const moreElements = await res.json();
      
      // Filter out elements that already exist to prevent duplicates
      const newElements = moreElements.filter((el: any) => cy.getElementById(el.data.id).empty());
      if (newElements.length > 0) {
        cy.add(newElements);
      }

      cy.layout({
        name: 'fcose',
        animate: true,
        fit: true,
        padding: 30
      } as any).run();
    } catch (err) {
      console.error("Failed to expand node:", err);
    }
  };

  const handleTogglePin = () => {
    if (!selectedNode || !cyRef.current) return;
    const node = cyRef.current.getElementById(selectedNode.id);
    if (!node.empty()) {
      if (selectedNode.pinned) {
        node.unlock();
        setSelectedNode({ ...selectedNode, pinned: false });
      } else {
        node.lock();
        setSelectedNode({ ...selectedNode, pinned: true });
      }
    }
  };

  const handleHideNode = () => {
    if (!selectedNode || !cyRef.current) return;
    const node = cyRef.current.getElementById(selectedNode.id);
    if (!node.empty()) {
      node.remove();
      setSelectedNode(null);
    }
  };

  const handleCenterNode = () => {
    if (!selectedNode || !cyRef.current) return;
    const node = cyRef.current.getElementById(selectedNode.id);
    if (!node.empty()) {
      cyRef.current.animate({
        center: { eles: node },
        zoom: 1.5
      }, { duration: 400 });
    }
  };

  const handleTraceShortestPath = () => {
    const path = findShortestPath(pathSource, pathTarget, OPERATIONAL_SYNDICATE_EDGES);
    setActivePath(path);

    if (cyRef.current && path.length > 0) {
      cyRef.current.elements().removeClass('path-highlight');
      path.forEach(nodeId => {
        cyRef.current?.getElementById(nodeId).addClass('path-highlight');
      });
    }
  };

  if (elements.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-tactical-400 font-mono text-sm p-6 text-center max-w-lg mx-auto">
        <Network className="w-10 h-10 mb-4 text-accent-cyan opacity-80" />
        <div className="font-bold text-white mb-2">Network Graph Analysis</div>
        <p className="text-xs text-tactical-400 mb-6">
          {!focusedEntity
            ? "Select an entity from the Dossier or search to begin interactive network graph exploration."
            : "No relational network data found for the selected entity."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setFocusedEntity("ent-person-arjun", "Arjun Sharma")}
            className="px-3 py-1.5 rounded bg-tactical-800 hover:bg-tactical-700 border border-tactical-600 hover:border-accent-cyan text-xs text-tactical-200 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-amber" />
            Explore Network: Arjun Sharma →
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-accent-cyan">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-tactical-900/50">
      <CytoscapeComponent
        elements={elements}
        style={{ width: "100%", height: "100%" }}
        stylesheet={[
          {
            selector: 'node',
            style: {
              'label': 'data(label)',
              'font-size': '10px',
              'font-family': 'monospace',
              'color': '#cbd5e1',
              'text-valign': 'bottom',
              'text-margin-y': 6,
              'background-color': '#475569',
              'width': 24,
              'height': 24,
              'border-width': 2,
              'border-color': '#1e293b'
            }
          },
          {
            selector: 'node.root',
            style: {
              'background-color': '#ef4444',
              'width': 32,
              'height': 32,
              'border-color': '#ffffff'
            }
          },
          {
            selector: 'node.person',
            style: {
              'background-color': '#0ea5e9'
            }
          },
          {
            selector: 'node.vehicle',
            style: {
              'background-color': '#f59e0b'
            }
          },
          {
            selector: 'node.bridge-node',
            style: {
              'border-color': '#f59e0b',
              'border-width': 3
            }
          },
          {
            selector: 'node.critical-node',
            style: {
              'background-color': '#ef4444',
              'border-color': '#ffffff',
              'border-width': 2
            }
          },
          {
            selector: 'node.path-highlight',
            style: {
              'background-color': '#00F0FF',
              'border-color': '#ffffff',
              'border-width': 4
            }
          },
          {
            selector: 'node:selected',
            style: {
              'border-color': '#00F0FF',
              'border-width': 3
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#475569',
              'target-arrow-color': '#475569',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '8px',
              'color': '#cbd5e1',
              'text-rotation': 'autorotate',
              'text-margin-y': -8
            }
          },
          {
            selector: 'edge.financial_flow',
            style: {
              'line-color': '#10b981',
              'target-arrow-color': '#10b981',
              'width': 3
            }
          },
          {
            selector: 'edge.communication',
            style: {
              'line-color': '#8b5cf6',
              'target-arrow-color': '#8b5cf6'
            }
          }
        ]}
        layout={{
          name: 'fcose',
          animate: true,
          randomize: true,
          fit: true,
          padding: 40
        }}
        cy={(cy: cytoscape.Core) => {
          cyRef.current = cy;
          cy.removeListener('tap');
          
          cy.on('tap', 'node', (evt: cytoscape.EventObject) => {
            const node = evt.target;
            const nodeId = node.id();
            setSelectedNode({
              id: nodeId,
              label: node.data('label') || nodeId,
              type: node.data('type') || 'Unknown',
              pinned: node.locked(),
              role: node.data('role'),
              threatLevel: node.data('threatLevel'),
              degreeCentrality: node.data('degreeCentrality'),
              isBridge: node.data('isBridge')
            });
            setFocusedEntity(nodeId, node.data('label') || nodeId);
          });

          cy.on('tap', (evt: cytoscape.EventObject) => {
            if (evt.target === cy) {
              setSelectedNode(null);
            }
          });
        }}
      />

      {/* Selected Node Action Toolbar */}
      {selectedNode && (
        <div className="absolute top-3 left-3 bg-tactical-900/95 border border-tactical-600 rounded p-2.5 flex items-center gap-2 shadow-lg z-20">
          <div className="font-mono text-xs text-white mr-2 border-r border-tactical-700 pr-3">
            <div className="font-bold text-accent-cyan">{selectedNode.label}</div>
            <div className="text-xxs text-tactical-400 uppercase flex items-center gap-1.5 mt-0.5">
              <span>{selectedNode.type}</span>
              {selectedNode.threatLevel && (
                <span className={`px-1 rounded text-[9px] font-bold ${selectedNode.threatLevel === 'CRITICAL' ? 'bg-accent-red text-white' : 'bg-accent-amber/20 text-accent-amber'}`}>
                  {selectedNode.threatLevel}
                </span>
              )}
            </div>
            {selectedNode.role && <div className="text-xxs text-tactical-300 font-mono mt-0.5">{selectedNode.role}</div>}
          </div>
          
          <button
            onClick={() => handleExpandNode(selectedNode.id)}
            title="Expand (+1 Hop)"
            className="p-1.5 hover:bg-tactical-800 text-tactical-300 hover:text-accent-cyan rounded transition-colors flex items-center gap-1 text-xxs font-mono"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Expand</span>
          </button>

          <button
            onClick={handleCenterNode}
            title="Center Node"
            className="p-1.5 hover:bg-tactical-800 text-tactical-300 hover:text-accent-cyan rounded transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleTogglePin}
            title={selectedNode.pinned ? "Unlock Position" : "Lock Position"}
            className="p-1.5 hover:bg-tactical-800 text-tactical-300 hover:text-accent-amber rounded transition-colors"
          >
            {selectedNode.pinned ? <Lock className="w-3.5 h-3.5 text-accent-amber" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleHideNode}
            title="Hide Node"
            className="p-1.5 hover:bg-tactical-800 text-tactical-300 hover:text-accent-red rounded transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive Network Inspector & Shortest Path Trace HUD */}
      <div className="absolute top-3 right-3 w-72 bg-tactical-900/95 border border-tactical-600 rounded shadow-lg p-3 z-20 backdrop-blur">
        <div className="flex items-center justify-between pb-2 border-b border-tactical-700">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-accent-cyan">
            <Route className="w-3.5 h-3.5" />
            <span>EVIDENTIARY PATH TRACE</span>
          </div>
          <span className="text-xxs font-mono text-tactical-400">GRAPH v2.4</span>
        </div>

        <div className="mt-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xxs font-mono text-tactical-400 block mb-1">SOURCE NODE</label>
              <select
                value={pathSource}
                onChange={(e) => setPathSource(e.target.value)}
                className="w-full bg-tactical-950 border border-tactical-700 text-xxs font-mono text-tactical-200 rounded px-1.5 py-1"
              >
                {OPERATIONAL_SYNDICATE_NODES.map(n => (
                  <option key={`src-${n.id}`} value={n.id}>{n.label} ({n.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xxs font-mono text-tactical-400 block mb-1">TARGET NODE</label>
              <select
                value={pathTarget}
                onChange={(e) => setPathTarget(e.target.value)}
                className="w-full bg-tactical-950 border border-tactical-700 text-xxs font-mono text-tactical-200 rounded px-1.5 py-1"
              >
                {OPERATIONAL_SYNDICATE_NODES.map(n => (
                  <option key={`tgt-${n.id}`} value={n.id}>{n.label} ({n.id})</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleTraceShortestPath}
            className="w-full py-1.5 bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan text-accent-cyan font-mono text-xxs font-bold rounded flex items-center justify-center gap-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>FIND SHORTEST PATH</span>
          </button>

          {activePath && (
            <div className="bg-tactical-950 p-2 rounded border border-tactical-800 font-mono text-xxs text-tactical-300">
              <div className="text-accent-cyan font-bold mb-1">FOUND CHAIN ({activePath.length} NODES):</div>
              <div className="text-xxs text-tactical-200">{activePath.join(' → ')}</div>
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-tactical-700">
          <div className="text-xxs font-mono text-tactical-400 mb-1.5">NETWORK LEGEND</div>
          <div className="grid grid-cols-2 gap-1.5 text-xxs font-mono text-tactical-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-red border border-white" />
              <span>Kingpin / Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-accent-amber bg-tactical-800" />
              <span>Hawala Bridge</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-emerald-500" />
              <span>Financial Flow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-purple-500" />
              <span>Encrypted Call</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
