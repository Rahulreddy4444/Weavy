import { Node, Edge } from 'reactflow';

export class WorkflowEngine {
  private nodes: Node[];
  private edges: Edge[];
  private nodeResults: Map<string, any> = new Map();

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  /**
   * Build dependency graph
   */
  private buildDependencyGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    // Initialize all nodes
    this.nodes.forEach(node => {
      graph.set(node.id, []);
    });

    // Add edges (dependencies)
    this.edges.forEach(edge => {
      const dependencies = graph.get(edge.target) || [];
      dependencies.push(edge.source);
      graph.set(edge.target, dependencies);
    });

    return graph;
  }

  /**
   * Validate that workflow is a DAG (no cycles)
   */
  validateDAG(): { valid: boolean; error?: string } {
    const graph = this.buildDependencyGraph();
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const dependencies = graph.get(nodeId) || [];
      for (const depId of dependencies) {
        if (!visited.has(depId)) {
          if (hasCycle(depId)) return true;
        } else if (recursionStack.has(depId)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of graph.keys()) {
      if (!visited.has(nodeId)) {
        if (hasCycle(nodeId)) {
          return {
            valid: false,
            error: 'Workflow contains circular dependencies (cycles)',
          };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Get execution order using topological sort
   */
  getExecutionOrder(): string[] {
    const graph = this.buildDependencyGraph();
    const inDegree = new Map<string, number>();
    
    // Calculate in-degree for each node
    this.nodes.forEach(node => {
      inDegree.set(node.id, 0);
    });

    this.edges.forEach(edge => {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    // Find nodes with no dependencies
    const queue: string[] = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    const order: string[] = [];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      order.push(nodeId);

      // Find nodes that depend on this node
      this.edges
        .filter(edge => edge.source === nodeId)
        .forEach(edge => {
          const newDegree = (inDegree.get(edge.target) || 0) - 1;
          inDegree.set(edge.target, newDegree);
          
          if (newDegree === 0) {
            queue.push(edge.target);
          }
        });
    }

    return order;
  }

  /**
   * Get nodes that can execute in parallel
   */
  getParallelBatches(): string[][] {
    const graph = this.buildDependencyGraph();
    const completed = new Set<string>();
    const batches: string[][] = [];

    while (completed.size < this.nodes.length) {
      const batch: string[] = [];

      // Find nodes where all dependencies are completed
      this.nodes.forEach(node => {
        if (completed.has(node.id)) return;

        const dependencies = graph.get(node.id) || [];
        const allDepsCompleted = dependencies.every(dep => completed.has(dep));

        if (allDepsCompleted) {
          batch.push(node.id);
        }
      });

      if (batch.length === 0) break; // Safety check

      batches.push(batch);
      batch.forEach(nodeId => completed.add(nodeId));
    }

    return batches;
  }

  /**
   * Get input data for a node from connected nodes
   */
  getNodeInputs(nodeId: string): Record<string, any> {
    const inputs: Record<string, any> = {};
    
    // Find edges targeting this node
    const incomingEdges = this.edges.filter(edge => edge.target === nodeId);
    
    incomingEdges.forEach(edge => {
      const sourceNode = this.nodes.find(n => n.id === edge.source);
      const sourceResult = this.nodeResults.get(edge.source);
      
      if (sourceNode && sourceResult) {
        const handleId = edge.targetHandle || 'default';
        inputs[handleId] = sourceResult;
      }
    });

    return inputs;
  }

  /**
   * Set node execution result
   */
  setNodeResult(nodeId: string, result: any) {
    this.nodeResults.set(nodeId, result);
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string): Node | undefined {
    return this.nodes.find(n => n.id === nodeId);
  }
}