class Solution:
    def search(self, nums: List[int], target: int) -> int:
        if not nums:
            return -1

        start = 0
        end = len(nums) - 1

        while start + 1 < end:
            mid = (start + end) // 2
            # discuss whetehr mid on top or down
            if nums[mid] > nums[end]:
                if nums[0] <= target <= nums[mid]:
                    end = mid
                else:
                    start = mid
            else:               # mid in bot
                if nums[mid] <= target <= nums[end]:
                    start = mid
                else:
                    end = mid

        if nums[start] == target:
            return start

        if nums[end] == target:
            return end

        return -1

