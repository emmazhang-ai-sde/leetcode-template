class Solution:
    def sortArray(self, nums: List[int]) -> List[int]:
        self.quickSort(nums,0,len(nums)-1)
        return nums
        # self.merge_sort(nums,0,len(nums)-1)
        # return nums

    def quickSort(self,A,start,end):
        if start >= end:
            return

        left,right = start,end
        pivot = A[(start + end) // 2]

        while left<=right:
            while left<=right and A[left] < pivot:
                left += 1
            while left<=right and A[right] > pivot:
                right -= 1
            if left <=right:
                temp = A[left]
                A[left] = A[right]
                A[right] = temp
                left += 1
                right -= 1
        #start right left end
        self.quickSort(A,start,right)
        self.quickSort(A,left,end)


    def merge_sort(self, nums, left: int, right: int):
        if left >= right:
            return
        mid = (left + right) // 2
        # Sort first and second halves recursively.
        self.merge_sort(nums,left, mid)
        self.merge_sort(nums,mid + 1, right)
        # Merge the sorted halves.
        self.merge(nums,left, mid, right, nums +[])

    def merge(self, A,start,middle,end,temp):
        leftIndex = start
        rightIndex = middle + 1
        index = start

        while leftIndex<=middle and rightIndex <=end:
            if A[leftIndex] < A[rightIndex]:
                temp[index] = A[leftIndex]
                leftIndex += 1
            else:
                temp[index] = A[rightIndex]
                rightIndex += 1
            index += 1

        while leftIndex<=middle:
            temp[index] = A[leftIndex]
            leftIndex += 1
            index += 1
        while rightIndex <=end:
            temp[index] = A[rightIndex]
            rightIndex += 1
            index += 1

        for i in range(start,end+1):
            A[i] = temp[i]
