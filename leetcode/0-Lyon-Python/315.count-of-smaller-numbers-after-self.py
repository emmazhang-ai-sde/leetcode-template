class Solution:
    def countSmaller(self, nums: List[int]) -> List[int]:
        from sortedcontainers import SortedDict
        sd = SortedDict()
        res = [0] * len(nums)
        for i in range(len(nums) - 1, -1, -1):
            num = nums[i]
            sd[(num, i)] = 1
            res[i] = self.binary_search(sd, num, i)
        return res

    def binary_search(self, sd, num, i):
        left, right = 0, len(sd) - 1
        while left + 1 < right:
            mid = (left + right) // 2
            mid_val = sd.peekitem(mid)[0]
            if mid_val < (num, i):
                left = mid
            elif mid_val > (num, i):
                right = mid
            else:
                return mid
        if sd.peekitem(left)[0] >= (num, i):
            return left
        return right