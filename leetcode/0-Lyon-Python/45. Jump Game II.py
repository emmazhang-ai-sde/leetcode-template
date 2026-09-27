class Solution:
    def jump(self, nums: List[int]) -> int:
        def helper(pos,nums):
            if memo[pos] != float('INF'):
                return memo[pos]

            nextPos = min( (pos + nums[pos]) , len(nums)-1)
            # print(nextPos)
            distance = float('INF')
            for i in range(nextPos, pos, -1):
                distance = min(distance, 1 + helper(i,nums))
            memo[pos] = distance
            return memo[pos]

        memo = [float('INF')] * len(nums)
        memo[len(nums)-1] = 0


        helper(0,nums)
        return memo[0]