class TwoSum:

    def __init__(self):
        self.nums = {}

    def add(self, number: int) -> None:
        self.nums[number] = self.nums.get(number, 0) + 1


    def find(self, value: int) -> bool:
        for key in self.nums:
            if value - key == key:
                if self.nums.get(value - key, 0) >= 2:
                    return True
            elif (value - key) in self.nums:
                return True
        return False;



# Your TwoSum object will be instantiated and called as such:
# obj = TwoSum()
# obj.add(number)
# param_2 = obj.find(value)