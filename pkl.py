import pickle

with open("idices.pkl", "rb") as f:
    data = pickle.load(f)

print(data)
