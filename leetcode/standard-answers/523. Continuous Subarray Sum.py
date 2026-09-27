class Solution:
    def checkSubarraySum(self, nums: List[int], k: int) -> bool:

        preSum = [0] * (len(nums) + 1)
        for i in range(len(nums)):
            preSum[i+1] = preSum[i] + nums[i]

        # prefix[j+1] - prefix[i] =  value
        # value % k == 0

        # prefix[j+1]%k = prefix[i] % k
        # Maps key:  val % k
        #      val:   index
        maps = {}
        # maps = {0:-1}
        for index,val in enumerate(preSum):
            if val % k in maps:
                # right + 1 = index
                if index -1 - maps[val % k] + 1>= 2:
                    return True
            if val % k not in maps:
                maps[val%k] = index
        return False