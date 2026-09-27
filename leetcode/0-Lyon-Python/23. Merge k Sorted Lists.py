# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        heap = []
        for i,list in enumerate(lists):
            if list:
                heapq.heappush(heap,(list.val,i,list))

        dummy = ListNode(0)
        tail = dummy
        while len(heap) >0:
            curr = heapq.heappop(heap)
            node = curr[2]
            tail.next = node
            tail = tail.next
            if node.next:
                heapq.heappush(heap, (node.next.val, curr[1], node.next))
        return dummy.next