class MedianFinder:

    def __init__(self):
        """
        initialize your data structure here.
        """

        self.min_heap = [] # n  n + 1
        self.max_heap = [] # n  n


    def addNum(self, num: int) -> None:

        heapq.heappush(self.max_heap, -1 * num)
        num = -1 * heapq.heappop(self.max_heap)
        heapq.heappush(self.min_heap, num)

        if len(self.min_heap) - len(self.max_heap) > 1:
            num = heapq.heappop(self.min_heap)
            heapq.heappush(self.max_heap, -1 * num)


    def findMedian(self) -> float:
        if len(self.min_heap) > len(self.max_heap):
            return self.min_heap[0]
        else:
            return (self.min_heap[0] - self.max_heap[0]) / 2


# Your MedianFinder object will be instantiated and called as such:
# obj = MedianFinder()
# obj.addNum(num)
# param_2 = obj.findMedian()