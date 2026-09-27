class Solution:
    def isValid(self, maps, k):
        count = 0
        for _, v in maps.items():
            count += v // 2
        return count >= k

    def findKPair(self, nums, k):
        maps = {}
        res = 0
        i = 0
        for j in range(len(nums)):
            letter = nums[j]
            maps[letter] = maps.get(letter, 0) + 1
            while self.isValid(maps, k):
                maps[nums[i]] -= 1
                res+=1
                i+=1
        return res



nums = [1,2,3,2,3]
k = 2

res = Solution()
print(res.findKPair(nums, k))


