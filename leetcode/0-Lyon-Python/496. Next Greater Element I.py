class Solution:
    def nextGreaterElement(self, nums1: List[int], nums2: List[int]) -> List[int]:
        stack = []
        maps = {}

        #decrease mono stack
        for num in nums2:
            while stack and num > stack[-1]:
                key = stack.pop()
                maps[key] = num
            stack.append(num)

        res = []
        for num in nums1:
            if num not in maps:
                res.append(-1)
            else:
                res.append(maps[num])

        return res