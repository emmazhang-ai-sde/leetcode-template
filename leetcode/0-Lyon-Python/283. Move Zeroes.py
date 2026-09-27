class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        k, fix = 0,0

        while  k < len(nums):
            if nums[k] != 0:
                nums[fix],nums[k] = nums[k],nums[fix]
                fix +=1

            k+=1
