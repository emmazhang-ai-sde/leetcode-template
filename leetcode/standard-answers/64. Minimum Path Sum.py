class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        memo = {}
        row = len(grid)
        col = len(grid[0])

        sums = 0
        for j in range(col):
            sums += grid[0][j]
            memo[0,j] = sums

        sums = 0
        for i in range(row):
            sums += grid[i][0]
            memo[i,0] = sums

        def dp(i,j,memo):
            if (i,j) in memo:
                return memo[i,j]

            left = dp(i,j-1,memo)
            top = dp(i-1,j,memo)

            memo[i,j] = min(left,top) + grid[i][j]

            return memo[i,j]

        return dp(row-1,col-1,memo)
