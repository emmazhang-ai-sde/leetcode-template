class Solution:
    def splitArray(self, nums: List[int], k: int) -> int:
        left, right = min(nums), sum(nums)
        while left + 1 < right:
            mid = (left + right) // 2
            if self.count(nums, mid) <= k:
                right = mid
            else:
                left = mid
        if self.count(nums, left) <= k:
            return left
        else:
            return right

    def count(self, nums, val): # 当subarray的和是val的时候，最小需要分成多少段
        if max(nums) > val:
            return float('INF')
        cur_sum, cut_count = 0, 0
        for num in nums:
            cur_sum += num
            if cur_sum > val:
                cut_count += 1
                cur_sum = num
        if cur_sum > 0:
            cut_count += 1
        return cut_count