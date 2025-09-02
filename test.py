# : Given an integer N and an array of size N-1 containing N-1 numbers between 1 to N. Find the number(between 1 to N), that is not present in the given array.
# Example 1:
# Input Format:
#  N = 5, array[] = {1,2,4,5}
# Result:
#  3
# Explanation:
# In the given array, number 3 is missing. So, 3 is the answer.

# Example 2:
# Input Format:
#  N = 3, array[] = {1,3}
# Result:
#  2
# Explanation:
# In the given array, number 2 is missing. So, 2 is the answer.
from typing import List


def findMissingInteger(num: int, nums: List[int]):
    for i in range(num-1):
        if nums[i] != i + 1:
            return i+1


findMissingInteger(6, [1, 2, 3, 5, 6])
