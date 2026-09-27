class Solution:
    def isValid(self, s: str) -> bool:
        match = {
            '[': ']',
            '(': ')',
            '{': '}'
        }
        stack = []
        for char in s:
            if char in match:
                stack.append(char)
            else:
                if not stack or char != match[stack.pop()]:
                    return False
        return len(stack) == 0