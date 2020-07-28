# -*- coding: utf-8 -*-

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import json
import pickle

import tweepy
import nagisa

ENV = json.load(open('env.json', 'r'))

auth = tweepy.OAuthHandler(
  ENV['TWITTER_API_KEY'],
  ENV['TWITTER_API_SECRET_KEY'])
auth.set_access_token(
  ENV['TWITTER_ACCESS_TOKEN'],
  ENV['TWITTER_ACCESS_TOKEN_SECRET'])
api = tweepy.API(auth, wait_on_rate_limit=True)

keyword = sys.stdin.readline().encode().decode('unicode-escape')
# keyword = "三浦春馬"

# ******************** 辞書読込
f = open("./python_code/pn.txt", "rb")
np_dic = pickle.load(f)
print(np_dic["楽"])


'''
total = {"p": 0, "n": 0, "e": 0}

for tweet in tweepy.Cursor(api.search, q=keyword).items(1):
  # print('tw OK.')
  res = {"p": 0, "n": 0, "e": 0}
  for t in tokenizer.tokenize(tweet.text):
    bf = t.base_form
    if bf in np_dic:
      r = np_dic[bf]
      if r in res:
        res[r] += 1
  if res["p"] - res["n"] > 0:
    total["p"] += 1
  elif res["p"] - res["n"] < 0:
    total["n"] += 1
  else:
    total["e"] += 1

print(str(total["p"]) + "," + str(total["n"]) + "," + str(total["e"]))
'''

# print(m.parse(keyword))