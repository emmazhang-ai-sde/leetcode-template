class Solution:
    def allPathsSourceTarget(self, graph: List[List[int]]) -> List[List[int]]:
        if not graph:
            return []
        ### DFS
        self.paths = list()
        path = []
        path.append(0)
        self.DFS(graph, 0, len(graph) - 1, path)
        return self.paths

    def DFS(self, graph, node, target, path):

        if node == target:
            self.paths.append(path + [])
            return

        for node_next in graph[node]:
            path.append(node_next)
            self.DFS(graph, node_next, target, path)
            path.pop()
