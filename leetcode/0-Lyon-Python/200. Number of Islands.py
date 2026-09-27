from collections import deque

class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        res = 0
        for row in range(len(grid)):
            for col in range(len(grid[0])):
                if grid[row][col] == "1":
                    res+=1
                    self.bfs(row, col, grid)
        return res


    def bfs(self,x,y, grid):
        queue = deque()
        queue.append((x,y))
        grid[x][y] = "0"

        while len(queue) > 0:
            size = len(queue)
            for _ in range(size):
                x,y = queue.popleft()
                for dx,dy in [(0,1),(0,-1),(1,0),(-1,0)]:
                    newx = x + dx
                    newy = y + dy
                    if self.isValid(newx,newy, grid):
                        grid[newx][newy] = "0"
                        queue.append((newx,newy))

    def isValid(self,x,y,grid):
        return 0<=x<len(grid) and 0<=y<len(grid[0]) and grid[x][y] == "1"
