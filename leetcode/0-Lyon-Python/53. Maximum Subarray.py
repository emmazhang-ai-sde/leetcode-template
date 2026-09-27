class Solution:
    def maxSubArray(self, nums: List[int]) -> int:

        prefix = [0] * (len(nums) + 1)
        for i, val in enumerate(nums):
            prefix[i+1] = prefix[i] + val

        minVal = prefix[0]
        res = nums[0]

        for val in prefix[1:]:
            res = max(res, val - minVal)
            minVal = min(minVal, val)
        return res