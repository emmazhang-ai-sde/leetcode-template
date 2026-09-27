import collections
class Node:
    def __init__(self, c):
        self.c = c
        self.word = ""
        self.child = collections.defaultdict(Node)


class Trie(object):

    def __init__(self):
        """
        Initialize your data structure here.
        """
        self.root = Node(None)


    def insert(self, word):
        """
        Inserts a word into the trie.
        :type word: str
        :rtype: void
        """
        root = self.root
        child = root.child

        for letter in word:
            if letter in child:
                root = child[letter]
            else:
                newNode = Node(letter)
                child[letter] = newNode
                root = newNode
            child = root.child

        root.word = word


    def search(self, word):
        """
        Returns if the word is in the trie.
        :type word: str
        :rtype: bool
        """
        root = self.root
        child = root.child

        for letter in word:
            if letter in child:
                root = child[letter]
            else:
                return False
            child = root.child

        if root.word == word:
            return True

        return False


    def startsWith(self, prefix):
        """
        Returns if there is any word in the trie that starts with the given prefix.
        :type prefix: str
        :rtype: bool
        """
        root = self.root
        child = root.child

        for letter in prefix:
            if letter in child:
                root = child[letter]
            else:
                return False
            child = root.child

        return True



# Your Trie object will be instantiated and called as such:
# obj = Trie()
# obj.insert(word)
# param_2 = obj.search(word)
# param_3 = obj.startsWith(prefix)