class Solution:
    def lengthOfLongestSubstringKDistinct(self, s: str, k: int) -> int:
        i = 0
        j = 0

        maxLen = 0
        maps = {}
        for j in range(len(s)):
            maps[s[j]] = maps.get(s[j], 0 ) + 1
            while len(maps) > k:
                maps[s[i]] -= 1
                if maps[s[i]] == 0:
                    maps.pop(s[i])
                i+=1
            maxLen = max(maxLen, j-i+1)


        return maxLen