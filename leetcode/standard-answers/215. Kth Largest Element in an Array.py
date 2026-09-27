class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        # heap = []

        # for i in nums:
        #     heapq.heappush(heap, i)
        #     while len(heap) > k:
        #         heapq.heappop(heap)
        # return heapq.heappop(heap)
        self.quickSelect(nums, 0, len(nums)-1, k)
        return nums[k-1]

    def quickSelect(self, nums, start, end, k):
        pivot = nums[(start + end) // 2]
        if start >= k:
            return
        if start >= end:
            return

        i, j = start, end
        while i <= j:
            while i <= j and nums[i] > pivot:
                i += 1
            while i <= j and nums[j] < pivot:
                j -= 1
            if i <= j:
                temp = nums[i]
                nums[i] = nums[j]
                nums[j] = temp
                i += 1
                j -= 1
        # start j i end
        self.quickSelect(nums, start, j, k)
        self.quickSelect(nums, i, end, k)