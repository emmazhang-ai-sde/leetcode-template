class Solution:
    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:
        i = 0
        ans = 0
        prod = 1
        for j in range(len(nums)):
            prod *= nums[j]
            while prod >= k and i <= j:
                prod /= nums[i]
                i+=1
            if j - i + 1 >= 0:
                ans += j - i + 1
        return ans