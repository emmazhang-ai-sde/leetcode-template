class Solution:
    def nextGreaterElements(self, nums: List[int]) -> List[int]:
        orignums = nums
        nums = nums + nums
        stack = []
        maps = {}

        for index, num in enumerate(nums):
            while stack and num > nums[stack[-1]]:
                key = stack.pop()
                maps[key] = index
            stack.append(index)

        res = []

        for index, num in enumerate(orignums):
            if index not in maps:
                res.append(-1)
            else:
                res.append(nums[maps[index]])
        return res