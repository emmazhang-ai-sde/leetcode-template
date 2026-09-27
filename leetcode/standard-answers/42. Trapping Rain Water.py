class Solution:
    def trap(self, heights: List[int]) -> int:
        water = 0
        stack = Deque([])
        for i, height in enumerate(heights):
            while len(stack) >0 and height > heights[stack[-1]]:
                stack_index = stack.pop()
                if len(stack) > 0:
                    width = i - stack[-1] - 1
                    newH = min(heights[i], heights[stack[-1]]) - heights[stack_index]
                    water += newH * width
            stack.append(i)
        return water
