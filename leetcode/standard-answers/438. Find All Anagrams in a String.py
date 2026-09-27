class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        counter = {}
        for letter in p:
            counter[letter] = counter.get(letter, 0) + 1

        j = 0
        res = []
        founder = {}
        i = 0

        for j in range(len(s)):
            c = s[j]
            founder[c] = founder.get(c,0) + 1
            while j - i + 1 > len(p):
                ch = s[i]
                founder[ch] -= 1
                if founder[ch] == 0:
                    founder.pop(ch)
                i+=1

            if  j - i + 1 == len(p):
                if counter == founder:
                    res.append(i)

        return res
