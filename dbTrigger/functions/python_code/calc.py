# -*- coding: utf-8 -*-

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf_8')
import json
import urllib.parse

import tweepy
# import oseti

ENV = json.load(open('env.json', 'r'))

auth = tweepy.OAuthHandler(
    ENV['TWITTER_API_KEY'],
    ENV['TWITTER_API_SECRET_KEY'])
auth.set_access_token(
    ENV['TWITTER_ACCESS_TOKEN'],
    ENV['TWITTER_ACCESS_TOKEN_SECRET'])

keyword = sys.stdin.readline().encode().decode('unicode-escape')
print(keyword)

api = tweepy.API(auth, wait_on_rate_limit=True)

# analyzer = oseti.Analyzer()

obj = []

prate = 0
nrate = 0
lrate = 0
'''
for tweet in tweepy.Cursor(api.search, q=keyword).items(1):
    # obj = analyzer.analyze(tweet.text)
    print(tweet.text)
'''
#print(prate)
#print(nrate)
#print(lrate)