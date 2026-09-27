class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        stack = []
        res = [0] * len(temperatures)

        for index, temperature in enumerate(temperatures):
            while stack and temperature > temperatures[stack[-1]]:
                key = stack.pop()
                res[key] = index - key
            stack.append(index)
        return res
