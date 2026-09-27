class Solution:
    def findMin(self, nums: List[int]) -> int:
        left = 0;
        right = len(nums) - 1

        while left + 1 < right:
            mid = (left + right) // 2
            if self.isValid(mid, nums):
                left = mid
            else:
                right = mid

        if not self.isValid(left, nums):
            return nums[left]

        if not self.isValid(right, nums):
            return nums[right]

    def isValid(self, x, nums):
        return nums[x] > nums[-1]
