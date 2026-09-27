class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        memo = {}
        memo[0,0] = True
        # s的剩下i字符和       p剩下j字符是匹配的

        def dp(i,j):
            if (i,j) in memo:
                return memo[i,j]

            if i == 0 and p[j-1] == '*':
                return dp(i,j-2)

            if i == 0 or j == 0:
                return False

            # Outlet of Recursion

            if  (s[i-1] == p[j-1] or p[j-1] == '.'):
                memo[i,j] = dp(i-1,j-1)

            if p[j-1] == '*':
                memo[i,j] = dp(i,j-2)   # * 匹配上了0个
                if  (p[j-2] == s[i-1] or p[j-2] == '.'):  # * 匹配上了1个
                    memo[i,j] = memo[i,j] or dp(i-1,j)

            if s[i-1] != p[j-1] and p[j-1] not in {'*','.'}:
                memo[i,j] = False

            return memo[i,j]

        return dp(len(s),len(p))