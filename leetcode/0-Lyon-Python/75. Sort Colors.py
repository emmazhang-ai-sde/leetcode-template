class Solution:
    def sortColors(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        left,i = 0,0
        right = len(nums) - 1

        def swap(nums,i,j):
            temp = nums[i]
            nums[i] = nums[j]
            nums[j] = temp

        while i <= right:
            if nums[i] == 0:
                swap(nums,i,left)
                i +=1
                left +=1
            elif nums[i] == 2:
                swap(nums,i,right)
                right -=1
            elif nums[i] == 1:
                i +=1