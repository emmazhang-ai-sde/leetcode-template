class Solution:
    def maxSubArrayLen(self, nums: List[int], k: int) -> int:
        prefix = [0] * (len(nums) + 1)
        for i, val in enumerate(nums):
            prefix[i+1] = prefix[i] + val

        maps = {}   # key: prefix Sum          value: index
        res = 0

        for index, val in enumerate(prefix):
            if val - k in maps:
                right = index - 1
                left = maps[val - k]
                res = max(res, right - left + 1)
            if val not in maps:
                maps[val] = index
        return res

        # [1,-1,5,-2,3]
        # [0,1,0,5,3,6]

        # prefix[right + 1] - prefix[left]   == k
        # B - A = k
        # B - k = A
