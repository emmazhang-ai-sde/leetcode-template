class Solution:
    def findMaxLength(self, nums: List[int]) -> int:
        for i in range(len(nums)):
            if nums[i] == 0:
                nums[i] = -1

        prefix = [0] * (len(nums) + 1)
        for i, num in enumerate(nums):
            prefix[i+1] = prefix[i] + num
        maxLen = 0
        maps = {} # key:  val in prefix  value: index
        # prefix[j+1] - prefix[i] == 0
        for index,val in enumerate(prefix):
            if val in maps:
                right = index - 1
                maxLen = max(maxLen, right - maps[val] + 1)
            if val not in maps:
                maps[val] = index
        return maxLen