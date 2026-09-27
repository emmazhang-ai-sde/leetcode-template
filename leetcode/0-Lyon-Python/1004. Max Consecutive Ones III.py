class Solution:
    def longestOnes(self, nums: List[int], k: int) -> int:

        if not nums or len(nums)==0:
            return 0
        i = 0
        j = 0
        ans = 0
        #       i: 以这个index 做为开头, [i,j]
        # 	    j: 最后一位有效位
        # 	    i j相互独立走完了全部的长度

        #solution2:考虑结尾
        countZero = 0
        for j in range(len(nums)):
            if nums[j] == 0:
                countZero +=1
            while countZero > k:
                if nums[i] == 0:
                    countZero -= 1
                i+=1
            ans = max(ans, j - i + 1)
        return ans
