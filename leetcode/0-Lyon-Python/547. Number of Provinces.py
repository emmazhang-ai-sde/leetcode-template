class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        visited = set()
        ans = 0
        for i in range(len(isConnected)):
            if i in visited:
                continue
            ans += 1
            self.bfs(i, visited, isConnected)
        return ans

    def bfs(self, i, visited, isConnected):
        import collections
        queue = collections.deque([i])
        visited.add(i)
        while queue:
            cur = queue.popleft()
            for ne in range(len(isConnected)):
                if isConnected[cur][ne] and ne not in visited:
                    visited.add(ne)
                    queue.append(ne)

    def dfs(self, i, visited, isConnected):

        for ne in range(len(isConnected)):
            if isConnected[i][ne] and ne not in visited:
                visited.add(ne)
                self.dfs(ne, visited, isConnected)