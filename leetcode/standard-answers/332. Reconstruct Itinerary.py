class Solution:
    def findItinerary(self, tickets: List[List[str]]) -> List[str]:
        graph = collections.defaultdict(list)
        for ticket in tickets:
            from_ = ticket[0]
            to_ = ticket[1]
            edges = graph[from_]
            heapq.heappush(edges, to_)

        path = []
        self.dfs("JFK", path, graph);
        path.reverse();
        return path;

    def dfs(self, node, path, graph):
        edges = graph[node]
        while len(edges) > 0:
            next = heapq.heappop(edges)
            self.dfs(next, path, graph)

        path.append(node)
