class Solution:

    #  nums                   [4,7,9,10]
    # if not missing:         [4,5,6,7]
    # index                   [0,1,2,3]
    # missing count           [0,2,3,3]
    def getMissingCount(self, index, nums):
        return nums[index] - (nums[0] + index)

    def missingElement(self, nums: List[int], k: int) -> int:
        start = 0
        end = len(nums) - 1

        while start + 1 < end:
            mid = (start + end) // 2
            if self.getMissingCount(mid, nums) < k:
                start = mid
            elif self.getMissingCount(mid, nums) > k:
                end = mid
            else:
                end = mid

        if self.getMissingCount(start, nums) >= k:
            #  Solution1: Last number if not missing + k
            return nums[0] + start-1 + k;
            #  Solution2: Last element + k - already missing
            # return nums[start -1] + k - self.getMissingCount(start, nums)

        if self.getMissingCount(end, nums) >= k:
            return nums[0] + end-1 + k;

        return nums[-1] + k - self.getMissingCount(len(nums)-1, nums)
