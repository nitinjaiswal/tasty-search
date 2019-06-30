# Tasty Search: search engine to search gourmet food reviews data
**Tasty Search** is a search engine built on Python (and Django) to search gourmet food reviews data and return the top K (configurable) reviews that have the highest overlap with input query.

## Dataset
Required dataset is downloaded from [Web data: Amazon Fine Foods reviews](http://snap.stanford.edu/data/web-FineFoods.html)

## Setting up
1. Clone the repo.
2. Install node and npm
2. run ``` npm install ```
3. run ``` bin/dev_start.sh ``` for local enviroment
4. run ``` bin/start.sh ``` for production enviroment 

## Live Demo
Live demo is deployed on aws. [Click here](http://ec2-3-90-21-183.compute-1.amazonaws.com)

Sample input : cat, processed, bad, good

Sample Response : [Click here](http://ec2-3-90-21-183.compute-1.amazonaws.com//v1/gourmet/gourmet/tastySearch?query=cat, processed, bad, good)
