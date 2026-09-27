class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        if not nums or len(nums) == 0:
            return 0

        fix = 1

        for p in range(1, len(nums)):
            if nums[p] != nums[p-1]:
                nums[fix] = nums[p]
                fix+=1

        return fix
 