import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  Connection,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Handle,
  Position,
  MarkerType,
  ReactFlowInstance,
  MiniMap,
  PanOnScrollMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

// Custom Node Type
interface CustomNodeData {
  label: string;
  documents: Array<{
    name: string;
    type: string;
    size: number;
    content: string | ArrayBuffer | null;
  }>;
  color?: string;
}

const nodeColors = [
  '#FF9B9B', // Soft Red
  '#9BFFC4', // Soft Green
  '#9BB5FF', // Soft Blue
  '#FFE89B', // Soft Yellow
  '#E2A2FF', // Soft Purple
];

// Connection Types
const connectionTypes = [
  { 
    id: 'single', 
    label: 'Arrow →', 
    markerEnd: 'url(#arrow)',
    style: { stroke: '#4CAF50', strokeWidth: 2 }
  },
  { 
    id: 'double', 
    label: 'Double ↔', 
    markerEnd: 'url(#arrow)',
    markerStart: 'url(#arrow)',
    style: { stroke: '#2196F3', strokeWidth: 2 }
  },
  { 
    id: 'dotted', 
    label: 'Dotted ⋯→',
    markerEnd: 'url(#arrow-closed)',
    style: { stroke: '#9C27B0', strokeWidth: 2, strokeDasharray: '5 5' }
  },
  { 
    id: 'thick', 
    label: 'Thick ⇒',
    markerEnd: 'url(#arrow-closed)',
    style: { stroke: '#FF9800', strokeWidth: 4 }
  },
  { 
    id: 'animated', 
    label: 'Animated ⇢',
    markerEnd: 'url(#arrow)',
    animated: true,
    style: { stroke: '#F44336', strokeWidth: 2 }
  },
];

// Custom Node Component
const CustomNode = ({ data, id }: { data: CustomNodeData; id: string }) => {
  const colorIndex = parseInt(id) % nodeColors.length;
  const backgroundColor = data.color || nodeColors[colorIndex];
  const [label, setLabel] = useState(data.label);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = () => {
    const event = new CustomEvent('deleteNode', { detail: { id } });
    window.dispatchEvent(event);
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Please upload PDF, TXT, MD, or DOC files.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newDoc = {
          name: file.name,
          type: file.type,
          size: file.size,
          content: e.target?.result || null
        };
        
        if (!data.documents) {
          data.documents = [];
        }
        data.documents.push(newDoc);
        // Force a re-render
        setIsEditing(prev => !prev);
      };

      if (file.type === 'application/pdf' || file.type.includes('word')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const handleTextChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = evt.target.value;
    setLabel(newValue);
    data.label = newValue;
  };

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault();
      evt.currentTarget.blur();
    }
  };

  const openDocument = (doc: CustomNodeData['documents'][0]) => {
    if (doc.type === 'text/plain' || doc.type === 'text/markdown') {
      const text = doc.content as string;
      const blob = new Blob([text], { type: doc.type });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    } else {
      // For PDF and other files that are stored as base64
      const url = doc.content as string;
      window.open(url, '_blank');
    }
  };

  return (
    <div className={`custom-node ${isEditing ? 'editing' : ''}`} style={{ backgroundColor }}>
      <Handle type="target" position={Position.Top} className="handle handle-top" />
      <Handle type="target" position={Position.Right} className="handle handle-right" />
      <Handle type="target" position={Position.Bottom} className="handle handle-bottom" />
      <Handle type="target" position={Position.Left} className="handle handle-left" />
      <Handle type="source" position={Position.Top} className="handle handle-top source" />
      <Handle type="source" position={Position.Right} className="handle handle-right source" />
      <Handle type="source" position={Position.Bottom} className="handle handle-bottom source" />
      <Handle type="source" position={Position.Left} className="handle handle-left source" />
      
      <textarea
        value={label}
        onChange={handleTextChange}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        onKeyDown={handleKeyDown}
        className={`nodrag node-text ${isEditing ? 'editing' : ''}`}
        placeholder="Type your content here..."
        spellCheck="false"
      />

      <div className="node-toolbar">
        <div className="node-actions">
          <label className="file-upload" title="Upload PDF, TXT, MD, DOC">
            📎
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.md,.doc,.docx"
              onChange={handleDocumentUpload}
              className="nodrag"
            />
          </label>
          <button className="delete-button nodrag" onClick={handleDelete} title="Delete node">
            🗑️
          </button>
        </div>
        {data.documents?.length > 0 && (
          <div className="documents-list">
            {data.documents.map((doc, index) => (
              <div key={index} className="document-item" onClick={() => openDocument(doc)}>
                {doc.type.includes('pdf') && '📄 '}
                {doc.type.includes('text') && '📝 '}
                {doc.type.includes('word') && '📰 '}
                {doc.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node<CustomNodeData>[] = [
  {
    id: '1',
    type: 'custom',
    data: { 
      label: 'Central Topic',
      documents: [],
      color: '#FFB6C1', // Light pink for central node
    },
    position: { x: 0, y: 0 },
    style: {
      padding: 10,
      borderRadius: 5,
      width: 200,
    },
  },
];

const initialEdges: Edge[] = [];

function App() {
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [connectionType, setConnectionType] = useState(connectionTypes[0]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  useEffect(() => {
    const handleDeleteNode = (event: CustomEvent<{ id: string }>) => {
      setNodes((nds) => nds.filter((node) => node.id !== event.detail.id));
      setEdges((eds) => eds.filter(
        (edge) => edge.source !== event.detail.id && edge.target !== event.detail.id
      ));
    };

    window.addEventListener('deleteNode', handleDeleteNode as EventListener);
    return () => {
      window.removeEventListener('deleteNode', handleDeleteNode as EventListener);
    };
  }, []);

  // Zoom controls
  const zoomIn = () => {
    reactFlowInstance?.zoomIn();
  };

  const zoomOut = () => {
    reactFlowInstance?.zoomOut();
  };

  const resetView = () => {
    reactFlowInstance?.setViewport({ x: 0, y: 0, zoom: 1 });
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const selectedType = connectionType;
      const newEdge = {
        ...params,
        type: selectedType.id,
        markerEnd: selectedType.markerEnd,
        markerStart: selectedType.markerStart,
        animated: selectedType.animated || false,
        style: selectedType.style,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [connectionType]
  );

  const addNewNode = () => {
    const newNode: Node<CustomNodeData> = {
      id: (nodes.length + 1).toString(),
      type: 'custom',
      data: { label: 'New Topic', documents: [] },
      position: {
        x: Math.random() * 500 - 250,
        y: Math.random() * 500 - 250,
      },
      style: {
        padding: 10,
        borderRadius: 5,
        width: 200,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const generateSummary = () => {
    // Create a map of node connections
    const nodeConnections = edges.reduce((acc: { [key: string]: string[] }, edge) => {
      if (!acc[edge.source]) acc[edge.source] = [];
      acc[edge.source].push(edge.target);
      return acc;
    }, {});

    // Generate connection summary
    const connectionSummary = nodes.map(node => {
      const connections = nodeConnections[node.id] || [];
      const connectedNodes = connections.map(targetId => {
        const targetNode = nodes.find(n => n.id === targetId);
        const connectionType = edges.find(e => e.source === node.id && e.target === targetId)?.type;
        return `"${node.data.label}" is connected to "${targetNode?.data.label}" with a ${connectionType} connection`;
      });

      return connectedNodes;
    }).flat();

    // Generate document summary
    const documentSummary = nodes.map(node => {
      const docs = node.data.documents;
      if (docs.length === 0) return null;

      return `Node "${node.data.label}" contains ${docs.length} document(s):
${docs.map(doc => {
  let content = '';
  if (doc.type === 'text/plain' || doc.type === 'text/markdown') {
    content = (doc.content as string)?.substring(0, 100) + '...';
  } else {
    content = '[Binary content]';
  }
  return `- ${doc.name}: ${content}`;
}).join('\n')}`;
    }).filter(Boolean);

    // Create plain text version for download
    const plainTextSummary = `MIND MAP SUMMARY\n\n` +
      `NODE STRUCTURE:\n` +
      nodes.map(node => `• ${node.data.label} (${node.data.documents.length} document(s))`).join('\n') +
      `\n\nCONNECTIONS:\n` +
      connectionSummary.map(conn => `• ${conn}`).join('\n') +
      (documentSummary.length > 0 ? `\n\nDOCUMENTS:\n${documentSummary.join('\n\n')}` : '');

    // Function to download summary
    const downloadSummary = () => {
      const blob = new Blob([plainTextSummary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mindmap-summary.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Create the summary HTML with download button
    const summaryHTML = `
      <div style="padding: 20px; max-width: 800px; font-family: Arial, sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="color: #333; margin: 0;">Mind Map Summary</h2>
          <button onclick="window.downloadSummary()" 
                  style="padding: 8px 16px; background: #2196F3; color: white; 
                         border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
            💾 Download
          </button>
        </div>
        
        <h3 style="color: #444; margin: 16px 0;">Node Structure</h3>
        <ul style="margin: 0; padding-left: 20px; color: #555;">
          ${nodes.map(node => `
            <li style="margin-bottom: 8px;">
              <strong>${node.data.label}</strong> 
              (${node.data.documents.length} document(s))
            </li>
          `).join('')}
        </ul>

        ${connectionSummary.length > 0 ? `
          <h3 style="color: #444; margin: 16px 0;">Connections</h3>
          <ul style="margin: 0; padding-left: 20px; color: #555;">
            ${connectionSummary.map(conn => `
              <li style="margin-bottom: 8px;">${conn}</li>
            `).join('')}
          </ul>
        ` : ''}

        ${documentSummary.length > 0 ? `
          <h3 style="color: #444; margin: 16px 0;">Documents</h3>
          <div style="color: #555; white-space: pre-wrap; line-height: 1.5;">
            ${documentSummary.join('\n\n')}
          </div>
        ` : ''}

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button onclick="this.parentElement.parentElement.parentElement.close()" 
                  style="padding: 8px 16px; background: #4CAF50; color: white; 
                         border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
            Close
          </button>
        </div>
      </div>
    `;

    // Create and show the modal
    const summaryDialog = document.createElement('dialog');
    summaryDialog.innerHTML = summaryHTML;
    document.body.appendChild(summaryDialog);

    // Add download function to window object to make it accessible from HTML
    (window as any).downloadSummary = downloadSummary;

    summaryDialog.showModal();

    // Clean up when dialog is closed
    summaryDialog.addEventListener('close', () => {
      document.body.removeChild(summaryDialog);
      delete (window as any).downloadSummary;
    });
  };

  const showHowToUse = () => {
    const howToUseHTML = `
      <div style="padding: 20px; max-width: 800px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; margin-bottom: 16px;">How to Use Mind Map</h2>
        
        <div style="color: #555; line-height: 1.6;">
          <h3 style="color: #444; margin: 16px 0;">Basic Operations</h3>
          <ul style="margin: 0 0 20px 0; padding-left: 20px;">
            <li><strong>Add New Topic:</strong> Click the "Add New Topic" button to create a new node</li>
            <li><strong>Edit Text:</strong> Click on any node's text area to edit its content</li>
            <li><strong>Delete Node:</strong> Hover over a node and click the 🗑️ button</li>
            <li><strong>Move Node:</strong> Click and drag a node to reposition it</li>
          </ul>

          <h3 style="color: #444; margin: 16px 0;">Connections</h3>
          <ul style="margin: 0 0 20px 0; padding-left: 20px;">
            <li><strong>Create Connection:</strong> Hover over a node to see connection points, then drag from one point to another node</li>
            <li><strong>Connection Types:</strong> Use the dropdown menu to select different connection styles:
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Arrow → : Simple directional connection</li>
                <li>Double ↔ : Bidirectional connection</li>
                <li>Dotted ⋯→ : Dotted line connection</li>
                <li>Thick ⇒ : Bold connection</li>
                <li>Animated ⇢ : Moving connection</li>
              </ul>
            </li>
          </ul>

          <h3 style="color: #444; margin: 16px 0;">Documents</h3>
          <ul style="margin: 0 0 20px 0; padding-left: 20px;">
            <li><strong>Attach Files:</strong> Click the 📎 button to attach PDF, TXT, MD, or DOC files to a node</li>
            <li><strong>View Files:</strong> Click on an attached file's name to open it</li>
          </ul>

          <h3 style="color: #444; margin: 16px 0;">Navigation</h3>
          <ul style="margin: 0 0 20px 0; padding-left: 20px;">
            <li><strong>Zoom:</strong> Use the 🔍+ and 🔍- buttons or mouse wheel to zoom in/out</li>
            <li><strong>Reset View:</strong> Click the ⟲ button to reset the view</li>
            <li><strong>Pan:</strong> Click and drag the empty space to pan around</li>
          </ul>

          <h3 style="color: #444; margin: 16px 0;">Summary</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Generate Summary:</strong> Click "Generate Summary" to create a overview of your mind map</li>
            <li><strong>Download Summary:</strong> In the summary view, click the 💾 button to download the summary as a text file</li>
          </ul>
        </div>

        <button onclick="this.parentElement.parentElement.close()" 
                style="margin-top: 20px; padding: 8px 16px; background: #4CAF50; color: white; 
                       border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
          Close
        </button>
      </div>
    `;

    const helpDialog = document.createElement('dialog');
    helpDialog.innerHTML = howToUseHTML;
    document.body.appendChild(helpDialog);
    helpDialog.showModal();

    helpDialog.addEventListener('close', () => {
      document.body.removeChild(helpDialog);
    });
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div className="controls">
        <div className="control-group">
          <button onClick={addNewNode}>Add New Topic</button>
          <select 
            value={connectionType.id}
            onChange={(e) => {
              const selected = connectionTypes.find(type => type.id === e.target.value);
              if (selected) setConnectionType(selected);
            }}
            className="connection-select"
          >
            {connectionTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <button onClick={zoomIn} className="zoom-btn">
            <span className="zoom-icon">🔍+</span>
          </button>
          <button onClick={resetView} className="zoom-btn">
            <span className="zoom-icon">⟲</span>
          </button>
          <button onClick={zoomOut} className="zoom-btn">
            <span className="zoom-icon">🔍-</span>
          </button>
        </div>
        <div className="control-group">
          <button onClick={generateSummary} className="summary-btn">
            Generate Summary
          </button>
          <button onClick={showHowToUse} className="help-btn" title="How to use">
            ❔
          </button>
        </div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={4}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={true}
        panOnScrollMode={PanOnScrollMode.Free}
        selectNodesOnDrag={false}
      >
        <svg>
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
            <marker
              id="arrow-closed"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>
        </svg>
        <Background />
        <Controls showZoom={false} />
        <MiniMap 
          nodeColor={(node) => {
            const data = node.data as CustomNodeData;
            return data.color || nodeColors[parseInt(node.id) % nodeColors.length];
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{
            backgroundColor: '#f8f9fa',
          }}
        />
      </ReactFlow>
    </div>
  );
}

export default App;
