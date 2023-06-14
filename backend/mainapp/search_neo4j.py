from py2neo import Graph


graph = Graph("bolt://localhost:7687", auth=("neo4j", "12345678"))


def precise_search_simple(node_name: str):
    query = """
        MATCH (node)-[relationship]-(relatedNode)
        WHERE node.name = $node_name
        RETURN relationship
        """

    result = graph.run(query, node_name=node_name)

    node = None
    nodes = []
    relationships = []
    for record in result:
        record = record['relationship']
        if record.start_node['name'] == node_name:
            if node is None:
                node = {
                    'id': record.start_node.identity,
                    'label': record.start_node['name'],
                }
                nodes.append(node)
            nodes.append({
                'id': record.end_node.identity,
                'label': record.end_node['name'],
            })
            relationships.append({
                'source': record.start_node.identity,
                'target': record.end_node.identity,
                'label': record['name'],
            })
    
    if node is None:
        return None
    return {
        'center': node,
        'nodes': nodes,
        'links': relationships,
    }