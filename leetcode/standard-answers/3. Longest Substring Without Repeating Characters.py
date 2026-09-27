class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        if not s or len(s)==0:
            return 0

        i = 0
        j = 0
        maps = {}
        ans = 0
        #       i: 以这个index 做为开头  valid substring header
        # 	    j: 最后一位有效位的下一位  next position(+1) of last valid index [i,j-1]
        # 	    i j相互独立走完了全部的长度

        # solution1:考虑开头
        # for i in range(len(s)):
        #     while j<len(s) and s[j] not in maps:
        #         maps[s[j]] = maps.get(s[j],0) + 1
        #         j+=1
        #     ans = max(ans, j - i )
        #     maps.pop(s[i])
        # return ans


        #       i: 以这个index 做为开头, [i,j]
        # 	    j: 最后一位有效位
        # 	    i j相互独立走完了全部的长度

        #solution2:考虑结尾
        for j in range(len(s)):
            maps[s[j]] = maps.get(s[j],0) + 1
            while maps.get(s[j],0) > 1:
                maps[s[i]] -= 1
                i+=1
            ans = max(ans, j - i + 1)
        return ans
