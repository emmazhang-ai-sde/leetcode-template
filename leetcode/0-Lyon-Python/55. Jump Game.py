class Solution:
    def canJump(self, nums: List[int]) -> bool:
            memo = {} #  if you are able to reach the last index at index x
            memo[len(nums)-1] = True

            return self.dfs(0, nums, memo)


    def dfs(self, index, nums, memo):
        if index >= len(nums):
            return True

        if index in memo:
            return memo[index]

        res = False
        for step in range(nums[index],0, -1):
            res = res or self.dfs(index + step, nums, memo)
            if res:
                memo[index] = res
                return res
        memo[index] = res
        return False