# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverse(self, head: ListNode) -> ListNode:
        pre = None
        curr = head

        while curr:
            temp = curr.next
            curr.next = pre
            pre = curr
            curr = temp

        return pre
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        slow,fast = head, head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        newHead = self.reverse(slow)


        while newHead:
            if head.val != newHead.val:
                return False
            head = head.next
            newHead = newHead.next
        return True