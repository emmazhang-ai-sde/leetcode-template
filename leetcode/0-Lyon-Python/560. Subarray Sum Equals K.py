class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        prefix = [0] * (len(nums) + 1)
        for i, val in enumerate(nums):
            prefix[i+1] = prefix[i] + val

        maps = {}   # key: prefix Sum          value: index
        res = 0
        count = {}

        for index, val in enumerate(prefix):
            if val - k in maps:
                right = index - 1
                left = maps[val - k]
                res += count[val - k]
            if val not in maps:
                maps[val] = index
                count[val] = 1
            else:
                count[val] = count.get(val, 0) + 1
        return res