class Solution:
    def hasPath(self, maze: List[List[int]], start: List[int], destination: List[int]) -> bool:
        if not maze or not maze[0]:
            return False
        from collections import deque
        queue = deque([start])
        directions = [(0,1),(1,0),(-1,0),(0,-1)]
        visited = set()
        visited.add((start[0],start[1]))

        while queue:
            i,j = queue.popleft()
            if i == destination[0] and j == destination[1]:
                return True

            for di, dj in directions:
                ni,nj = i,j
                while self.couldPassBy(maze,ni+di,nj+dj):
                    ni,nj = ni+di,nj+dj

                if (ni,nj) not in visited and self.couldPassBy(maze, ni, nj):
                    visited.add((ni,nj))
                    queue.append([ni,nj])
        return False


    def couldPassBy(self,maze,i,j):
        return 0<=i<len(maze) and 0<=j<len(maze[0]) and maze[i][j] == 0