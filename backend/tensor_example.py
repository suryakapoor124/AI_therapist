import numpy as np

tensor_2d = np.array([
    [2, 5, 6],
    [7, 8, 9],
    [10, -2, 3]
])

print("2D Tensor:")
print(tensor_2d)

# Convert 2D tensor to 1D tensor
tensor_1d = tensor_2d.flatten()
print("\n1D Tensor:")
print(tensor_1d)
# Convert 2D tensor to 1D tensor using reshape
tensor_1d_reshape = tensor_2d.reshape(-1)
print("\n1D Tensor using reshape:")
print(tensor_1d_reshape)
