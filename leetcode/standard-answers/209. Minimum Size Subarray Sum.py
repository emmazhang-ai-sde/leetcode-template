class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        sums = 0
        i = 0

        minLen = len(nums) + 1
        for j in range(len(nums)):
            sums+= nums[j]
            while sums >= target:
                minLen = min(j-i+1, minLen)
                sums-= nums[i]
                i+=1

        if minLen == len(nums) + 1:
            return 0
        return minLen
