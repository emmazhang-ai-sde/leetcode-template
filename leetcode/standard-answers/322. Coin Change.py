class Solution:
    def coinChange(self, coins: 'List[int]', amount: 'int') -> 'int':
        def dfs(x, memo):
            if x in memo:
                return memo[x]

            if x < 0:
                return  float('INF')

            memo[x] = float('INF')
            for coin in coins:

                memo[x] = min(memo[x], dfs(x-coin, memo) + 1)

            return memo[x]

        memo = {}
        # initialize
        memo[0] = 0
        for coin in coins:
            memo[coin]  = 1

        ret = dfs(amount, memo)
        if ret == float('INF'):
            return -1
        else:
            return ret