class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        queue = deque()
        result = []
        start = 0
        for end, num in enumerate(nums):
            # sliding windows 内可能的最大值对应的index 单调递减deque
            while queue and nums[queue[-1]] <= num:
                queue.pop()
            queue.append(end)
            if end - start == k - 1:
                result.append(nums[queue[0]])
                # 如果sliding window 弹出最大值
                if queue[0] == start:
                    queue.popleft()
                start +=1
        return result
