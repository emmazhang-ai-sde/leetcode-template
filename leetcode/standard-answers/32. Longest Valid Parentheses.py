class Solution:
    def longestValidParentheses(self, s: str) -> int:
        if s == None:
            return 0

        stack = Deque([])
        maxLen = 0

        for i in range(len(s)):
            if s[i] == '(':
                stack.append('(')
                continue

            matchedLen = 0
            if stack and type(stack[-1]) == int:
                matchedLen += stack.pop()

            if stack and stack[-1] == '(':
                stack.pop() # 从最近的'('作为起点
                matchedLen += 2   #计算长度

                while stack and type(stack[-1]) == int:
                    matchedLen += stack.pop()
                maxLen = max(maxLen, matchedLen) # 更新当前匹配括号序列长度
                stack.append(matchedLen)
            else:
                stack.append(')')
        return maxLen

