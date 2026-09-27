class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        queue = collections.deque([])
        count = 0
        visited = set()
        for x,row in enumerate(grid):
            for y,val in enumerate(row):
                if val == 2:
                    queue.append((x,y))
                    visited.add((x,y))
                    count +=1
                if val == 1:
                    count +=1
        step = self.bfs(grid, queue, visited)
        # no orange at all
        if count == 0:
            return 0
        # Every oranges is rotted
        if len(visited)  == count:
            return step
            # Impossible
        return -1


    def bfs(self, grid, queue, visited):
        step = -1
        while len(queue) > 0:
            size = len(queue)
            for _ in range(size):
                x,y = queue.popleft()
                for dx,dy in [(0,1),(0,-1),(1,0),(-1,0)]:
                    newx = x + dx
                    newy = y + dy
                    if self.isValid(newx,newy, grid, visited):
                        visited.add((newx,newy))
                        queue.append((newx,newy))
            step +=1
        return step

    def isValid(self,x,y,grid, visited):
        return 0<=x<len(grid) and 0<=y<len(grid[0]) and (x,y) not in visited and grid[x][y] == 1
