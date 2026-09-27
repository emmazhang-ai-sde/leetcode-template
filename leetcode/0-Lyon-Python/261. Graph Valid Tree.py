import collections
class Solution:
    def validTree(self, n: int, edges: List[List[int]]) -> bool:
        # if edges != node -1
        if len(edges) != n-1:
            return False;

        graphs = collections.defaultdict(list)
        # Create Graph
        for edge in edges:
            start = edge[0]
            end = edge[1]
            graphs[start].append(end)
            graphs[end].append(start)

        queue = collections.deque([])
        visited = {0}
        queue.append(0)
        while len(queue) > 0:
            size = len(queue)
            for _ in range(size):
                curr = queue.popleft()
                neighbours = graphs.get(curr, [])
                for neighbour in neighbours:
                    if neighbour not in visited:
                        visited.add(neighbour)
                        queue.append(neighbour)

        return len(visited) == n

