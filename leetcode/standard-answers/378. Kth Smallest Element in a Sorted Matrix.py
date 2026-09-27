class Solution:
    def kthSmallest(self, matrix: List[List[int]], k: int) -> int:
        n = len(matrix)

        #minHeap[value, x, y] - 3 element tuple
        min_heap = [(matrix[0][0], 0,0)]
        visited = set()
        visited.add((0,0))

        for i in range(k):      # O (K)
            num,x,y = heapq.heappop(min_heap)

            #iterate previously popped element neighbors, update the valid neighbors to our minheap and mark as visited
            for dx, dy in [(0, 1), (1, 0)]:
                newx = x + dx
                newy = y + dy

                if 0<=newx<n and 0<=newy<n and (newx,newy) not in visited:
                    visited.add((newx,newy))
                    heapq.heappush(min_heap, (matrix[newx][newy], newx, newy))  # LgK

        return num