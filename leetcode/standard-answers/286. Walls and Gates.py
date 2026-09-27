class Solution:
    def wallsAndGates(self, rooms: List[List[int]]) -> None:
        """
        Do not return anything, modify rooms in-place instead.
        """
        import collections
        queue = collections.deque([])
        visited = set()
        for i, row in enumerate(rooms):
            for j, val in enumerate(row):
                if val == 0:
                    queue.append((i,j))
                    visited.add((i,j))
        self.bfs(rooms, queue, visited)

    def bfs(self, grid, queue, visited):
        step = 1
        while len(queue) > 0:
            size = len(queue)
            for _ in range(size):
                x,y = queue.popleft()
                for dx,dy in [(0,1),(0,-1),(1,0),(-1,0)]:
                    newx = x + dx
                    newy = y + dy
                    if self.isValid(newx,newy, grid, visited):
                        visited.add((newx,newy))
                        grid[newx][newy] = step
                        queue.append((newx,newy))
            step +=1

    def isValid(self,x,y,grid, visited):
        return 0<=x<len(grid) and 0<=y<len(grid[0]) and (x,y) not in visited and grid[x][y] != -1
