class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        start = 0
        end = len(nums) - 1

        while start + 1 < end:
            mid = (start + end) // 2
            if nums[mid] < target:
                start = mid
            elif nums[mid] > target:
                end = mid
            else:
                return mid

        # Solution1: Last num < targetr
        # if nums[end] < target:
        #     return end + 1
        # if nums[start] < target:
        #     return start + 1
        # return 0


        # Solution 2: First num >= targetr
        if nums[start] >= target:
            return start
        if nums[end] >= target:
            return end
        return len(nums)
