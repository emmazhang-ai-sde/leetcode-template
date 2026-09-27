class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        import heapq
        graph = collections.defaultdict(list)
        for start,end,val in times:
            graph[start].append((val, end))
        heap = []
        heapq.heappush(heap, (0,k))
        return self.dijkstra(heap, n, graph)

    def dijkstra(self, heap, n, graph):
        visited = {}

        while len(heap) > 0:
            curr, node = heapq.heappop(heap)
            if node in visited:
                continue
            visited[node] = curr
            if len(visited) == n:
                return curr
            for val, nextNode in graph[node]:
                if nextNode not in visited:
                    heapq.heappush(heap, (val + curr, nextNode))
        return -1
