import tweepy
import oseti
import json
import sys

ENV = json.load(open('env.json', 'r'))

auth = tweepy.OAuthHandler(
  ENV['TWITTER_API_KEY'],
  ENV['TWITTER_API_SECRET_KEY'])
auth.set_access_token(
  ENV['TWITTER_ACCESS_TOKEN'],
  ENV['TWITTER_ACCESS_TOKEN_SECRET'])

keyword = sys.stdin.readline()

# api = tweepy.API(auth, wait_on_rate_limit=True)

# analyzer = oseti.Analyzer()

obj = []

prate = 0
nrate = 0
lrate = 0

# print(prate)
# print(nrate)
print(keyword)