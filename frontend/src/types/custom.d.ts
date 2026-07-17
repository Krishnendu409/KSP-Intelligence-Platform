declare module 'react-cytoscapejs' {
  import cytoscape from 'cytoscape';
  import { Component } from 'react';

  interface CytoscapeComponentProps {
    elements: cytoscape.ElementDefinition[];
    style?: React.CSSProperties;
    stylesheet?: any;
    layout?: any;
    cy?: (cy: cytoscape.Core) => void;
  }

  export default class CytoscapeComponent extends Component<CytoscapeComponentProps> {}
}

declare module 'cytoscape-fcose' {
  import cytoscape from 'cytoscape';
  const fcose: cytoscape.Ext;
  export default fcose;
}
