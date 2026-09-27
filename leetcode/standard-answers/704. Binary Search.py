class Solution:
    def search(self, nums: List[int], target: int) -> int:
        start = 0
        end = len(nums) - 1

        while start + 1 < end:
            mid = (start + end) // 2

            if nums[mid] < target:
                start = mid
            elif  nums[mid] > target:
                end = mid
            else:
                return mid

        if nums[start] == target:
            return start

        if nums[end] == target:
            return end

        return -1