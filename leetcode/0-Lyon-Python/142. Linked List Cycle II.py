# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = head
        fast = head
        hasCycle = False

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                hasCycle = True
                fast = head
                break

        if not hasCycle:
            return None

        if fast == slow:
            return slow

        while fast:
            slow = slow.next
            fast = fast.next
            if slow == fast:
                return slow

        return None