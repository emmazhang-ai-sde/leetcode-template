class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        digitToWord = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
                       "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
        res = []
        self.dfs([], res, digits, 0, digitToWord)
        return res


    def dfs(self, temp, res, digits, startIndex, digitToWord):
        if len(temp) == len(digits):
            if temp:
                res.append(''.join(temp +[]))  #deepcopy
            return

        for i in range(startIndex, len(digits)):
            digit = digits[i]
            for letter in digitToWord.get(digit):
                temp.append(letter)
                self.dfs(temp, res, digits, i+1, digitToWord)    # i or i+1
                temp.pop(-1)

