class Solution:
    def minWindow(self, s: str, t: str) -> str:
        targets = {}
        for letter in t:
            targets[letter] = targets.get(letter, 0) + 1

        minsize = float('INF')
        ans = ""
        i = 0
        matchedLetter = 0 #

        len_t = len(t)

        for j in range(len(s)):
            if targets.get(s[j], -1) >= 1:
                matchedLetter+=1
            if s[j] in targets:
                targets[s[j]] -= 1
            while len_t == matchedLetter:
                if j - i + 1 < minsize:
                    minsize = min(minsize, j - i + 1)
                    ans = s[i:j+1]
                if (targets.get(s[i], -1) >= 0):
                    matchedLetter-=1
                if s[i] in targets:
                    targets[s[i]] += 1
                i+=1
        return ans

    # def minWindow(self, s: str, t: str) -> str:
    #         maps = {}
    #         targets = {}
    #         for letter in t:
    #             targets[letter] = targets.get(letter, 0) + 1

    #         minsize = float('INF')
    #         ans = ""
    #         i = 0

    #         for j in range(len(s)):
    #             maps[s[j]] = maps.get(s[j],0) + 1
    #             while self.isValid(maps, targets):
    #                 if j - i + 1 < minsize:
    #                     minsize = min(minsize, j - i + 1)
    #                     ans = s[i:j+1]
    #                 maps[s[i]] -= 1
    #                 i+=1
    #         return ans

    # def isValid(self, maps, targets):
    #     for k,v in targets.items():
    #         if maps.get(k, 0) < v:
    #             return False
    #     return True