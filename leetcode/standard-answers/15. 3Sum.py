class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        res = []

        for k in range(len(nums) - 2):
            if k > 0 and nums[k-1] == nums[k]:
                continue
            target = -1 * nums[k]
            i = k+1
            j = len(nums) - 1

            while i < j:
                if nums[i] + nums[j] == target:
                    res.append([nums[k], nums[i], nums[j]])
                    i+=1
                    j-=1
                    while i<j and nums[i-1] == nums[i]:
                        i+=1
                    while i<j and nums[j+1] == nums[j]:
                        j-=1
                elif nums[i] + nums[j] < target:
                    i+=1
                else:
                    j-=1
        return res





